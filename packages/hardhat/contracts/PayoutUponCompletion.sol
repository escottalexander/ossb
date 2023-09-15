//SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// Use openzeppelin to inherit battle-tested implementations
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * Contract for managing tasks leading to a payout to a particular address when the work has been approved by the approver
 * @author escottalexander
 */
contract PayoutUponCompletion is Ownable {
	using SafeERC20 for IERC20;

	struct Task {
		address reviewer; // The one who can determine if this task has been completed, able to set to approved or canceled status
		uint8 reviewerPercentage; // Percentage of funds that go to reviewer, set at creation, payed out when worker claims funds
		address approvedWorker; // The worker who is able to claim funds when approved, can be set before or after work is submitted
		// mapping(address => uint) totalFunding; // TokenAddress => amount deposited - zero address for ETH - can be derived from funding below
		mapping(address => bool) hasFundingType; // Used for making sure fundingType only contains unique items
		address[] fundingType; // Token addresses for each asset funding
		mapping(address => bool) hasFunderAddress; // Used for making sure funderAddresses only contains unique items
		address[] funderAddresses; // Unique funder addresses
		mapping(address => mapping(address => uint)) funding; // FunderAddress => tokenAddress => amount
		uint creationTime; // Include this to refund users after certain time has passed
		bool approved; // Has task been reviewed and accepted, worker can be payed out
		bool canceled; // Everyone is refunded when a task moves to this state
		bool complete; // All funds have been allocated
	}

	// Immutable variables
	uint8 oneHundred = 100;

	// State Variables
	uint8 public protocolTakeRate; // Percentage that protocol takes from every bounty claim
	uint8 public maxProtocolTakeRate = 50; // Protocol won't be able to take more than this / 1000 of a bounty - 5% at default level - and this can never be modified upwards
	uint32 public unlockPeriod = 63072000; // Two years in seconds - Anyone can cancel a task after this time period - uint32 maximimum is 136 years
	address public protocolAddress; // Address that can claim funds that were allocated to protocol

	uint public currentTaskIndex;
	mapping(uint => Task) public tasks;
	mapping(address => mapping(address => uint)) withdrawableFunds; // fundOwner => tokenAddress => amount, can be withdrawn by fundOwner at anytime
	mapping(address => uint) totalTokenBalance;

	// Events
	event TaskCreated (uint indexed index, string taskLocation, address reviewer);
	event TaskFunded (uint indexed index, uint amount, address token);
	event TaskCanceled (uint indexed index);
	event TaskApproved (uint indexed index, address worker);
	event TaskFinalized (uint indexed index);
	event Withdraw (address indexed receiver, uint amount, address token);
	event WorkSubmitted (uint indexed index, address worker, string workUrl);
	event ApprovedWorkerSet (uint indexed index, address worker);

	// Governance Events
	event TakeRateAdjusted (uint8 takeRate);
	event MaxTakeRateLowered (uint8 maxTakeRate);
	event UnlockPeriodAdjusted (uint32 unlockPeriod);
	event ProtocolAddressAdjusted(address protocolAddress);

	// Errors
	error NotAuthorized();
	error ZeroAddressNotAllowed();
	error TaskDoesNotExist();
	error TaskInFinalState();
	error WorkNotApproved();
	error ExceedsLimit();
	error FailedToSend();
	error AmountNotSet();
	// Functions
	constructor(uint8 _protocolTakeRate, address _protocolAddress) {
		if (_protocolTakeRate > maxProtocolTakeRate) {
			revert ExceedsLimit();
		}
		if (_protocolAddress == address(0)) {
			revert ZeroAddressNotAllowed();
		}
		protocolTakeRate = _protocolTakeRate;	
		protocolAddress = _protocolAddress;
	}

	// Main Workflows
	function createTask(string memory taskLocation, address reviewer, uint8 reviewerPercentage) external {
		if (reviewer == address(0)) {
			revert ZeroAddressNotAllowed();
		}
		if (reviewerPercentage > oneHundred) {
			revert ExceedsLimit();
		}
		_createTask(taskLocation, reviewer, reviewerPercentage);
	}

	function createAndFundTask(string memory taskLocation, address reviewer, uint8 reviewerPercentage, uint amount, address token) external payable {
		if (reviewer == address(0)) {
			revert ZeroAddressNotAllowed();
		}
		if (reviewerPercentage > oneHundred) {
			revert ExceedsLimit();
		}
		uint index = _createTask(taskLocation, reviewer, reviewerPercentage);
		_fundTask(index, amount, token);
	}

	function fundTask(uint taskIndex, uint amount, address token) external payable {
		if (currentTaskIndex <= taskIndex) {
			revert TaskDoesNotExist();
		}
		_fundTask(taskIndex, amount, token);
	}

	function withdraw(uint amount, address tokenAddress) external {
		if (amount > withdrawableFunds[msg.sender][tokenAddress]) {
			revert ExceedsLimit();
		}
		withdrawableFunds[msg.sender][tokenAddress] -= amount;
		// Remove funds from total balance mapping
		totalTokenBalance[tokenAddress] -= amount;
		if (tokenAddress == address(0)){
			// ETH
			(bool sent,) = msg.sender.call{value: amount}("");
			if (!sent) {
				revert FailedToSend();
			}
		} else {
			IERC20(tokenAddress).safeTransfer(msg.sender, amount);
		}
		
		emit Withdraw(msg.sender, amount, tokenAddress);
	}

	function _createTask(string memory taskLocation, address reviewer, uint8 reviewerPercentage) internal returns (uint idx) {
		idx = currentTaskIndex;
		Task storage task = tasks[idx];
		task.reviewer = reviewer;
		task.reviewerPercentage = reviewerPercentage;
		task.creationTime = block.timestamp;

		// Increment index for next entry
		currentTaskIndex ++;

		// Emit event
		emit TaskCreated(idx, taskLocation, reviewer);

		// returning the idx in case other processes need it to further modify the task
		return idx;
	}

	function _fundTask(uint taskIndex, uint amount, address token) internal {
		Task storage task = tasks[taskIndex];
		if (task.complete || task.canceled) {
			revert TaskInFinalState();
		}
		// Transfer value
		if (token == address(0)) {
			if (amount == 0 || msg.value != amount) {
				revert AmountNotSet();
			}
			// Must be ETH
			( bool sent, ) = address(this).call{value: msg.value}("");
			if (!sent) {
				revert FailedToSend();
			}
		} else {
			if (amount == 0) {
				revert AmountNotSet();
			}
			IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
		}
		// Update State
		_addFunderAndFunds(task, token, amount);

		emit TaskFunded(taskIndex, amount, token);
	}

	function _addFunderAndFunds(Task storage task, address token, uint amount) internal {
		// Check if token address is already recorded
		if (!task.hasFundingType[token]) {
			task.hasFundingType[token] = true;
			task.fundingType.push(token);
		}
		// Check if funder address is already recorded
		if (!task.hasFunderAddress[msg.sender]){
			task.hasFunderAddress[msg.sender] = true;
			task.funderAddresses.push(msg.sender);
		}
		// Add funds to task
		task.funding[msg.sender][token] += amount;
		// Add funds to total balance mapping
		totalTokenBalance[token] += amount;
	}

	function submitWork(uint taskIndex, string calldata workUrl) external {
		emit WorkSubmitted(taskIndex, msg.sender, workUrl);
	}
	
	// Big Payouts when this is called - take heed
	function cancelTask(uint taskIndex) external {
		Task storage task = tasks[taskIndex];
		if (msg.sender != task.reviewer || block.timestamp - unlockPeriod < task.creationTime) {
			revert NotAuthorized();
		}
		task.canceled = true;
		// Refund all funders
		uint funderLength = task.funderAddresses.length;
		uint fundingLength = task.fundingType.length;
		for (uint i; i < funderLength;) {
			for (uint h; h < fundingLength;) {
				address funder = task.funderAddresses[i];
				address token = task.fundingType[h];
				uint amount = task.funding[funder][token];
				if (amount > 0) {
					withdrawableFunds[funder][token] += amount;
				}
				unchecked {
					h ++;
				}
			}
			unchecked {
				i ++;
			}
		}
		emit TaskCanceled(taskIndex);
	}

	// Anyone can do this if its in the right state
	function finalizeTask(uint taskIndex) external {
		Task storage task = tasks[taskIndex];
		if (task.complete || task.canceled) {
			revert TaskInFinalState();
		}
		if (!task.approved) {
			revert WorkNotApproved();
		}
		task.complete = true;
		uint fundingLength = task.fundingType.length;
		uint funderLength = task.funderAddresses.length;
		for (uint h; h < fundingLength;) {
			address token = task.fundingType[h];
			uint totalAmount;
			for (uint i; i < funderLength;) {
				address funder = task.funderAddresses[i];
				totalAmount += task.funding[funder][token];
				unchecked {
					i ++;
				}
			}
			_divyUp(totalAmount, token, task.reviewer, task.approvedWorker, task.reviewerPercentage);
			unchecked {
				h ++;
			}
		}
		emit TaskFinalized(taskIndex);
	}

	// Need to review math here to confirm tokens don't get stuck in the contract
	function _divyUp(uint amount, address token, address reviewer, address worker, uint reviewerPercentage) internal {
		if (protocolTakeRate > 0) {
			uint protocolShare = amount * protocolTakeRate / 1000; // By dividing by 1000 this allows us to adjust the take rate to be as granular as 0.1%
			withdrawableFunds[protocolAddress][token] += protocolShare;
			amount = amount - protocolShare;
		}
		if (reviewerPercentage > 0) {
			uint reviewerShare = amount * reviewerPercentage / 100;
			withdrawableFunds[reviewer][token] += reviewerShare;
			amount = amount - reviewerShare;
		}
		
		withdrawableFunds[worker][token] += amount;
	}

	// Reviewer only functions
	function approveTask(uint taskIndex, address approvedWorker) external {
		Task storage task = tasks[taskIndex];
		if (msg.sender != task.reviewer) {
			revert NotAuthorized();
		}
		if (approvedWorker == address(0)) {
			revert ZeroAddressNotAllowed();
		}
		task.approvedWorker = approvedWorker;
		task.approved = true;

		emit TaskApproved(taskIndex, approvedWorker);
	}

	function setApprovedWorker(uint taskIndex, address approvedWorker) external {
		Task storage task = tasks[taskIndex];
		if (msg.sender != task.reviewer) {
			revert NotAuthorized();
		}
		task.approvedWorker = approvedWorker;

		emit ApprovedWorkerSet(taskIndex, approvedWorker);
	}

	// Views
	function getWithdrawableBalance(address token) external view returns (uint) {
		return withdrawableFunds[msg.sender][token];
	}

	function getTask(uint taskIndex) external view returns (address, uint8, address, address[] memory, address[] memory, uint, bool, bool, bool) {
		Task storage task = tasks[taskIndex];
		return (task.reviewer, task.reviewerPercentage, task.approvedWorker, task.fundingType, task.funderAddresses, task.creationTime, task.approved, task.canceled, task.complete);
	}

	function getTaskFunding(uint taskIndex) external view returns (address[] memory, uint[] memory) {
		if (currentTaskIndex <= taskIndex) {
			revert TaskDoesNotExist();
		}
		Task storage task = tasks[taskIndex];
		uint[] memory amounts = new uint[](task.fundingType.length);
		uint fundingLength = task.fundingType.length;
		uint funderLength = task.funderAddresses.length;
		for (uint h; h < fundingLength;) {
			address token = task.fundingType[h];
			for (uint i; i < funderLength;) {
				address funder = task.funderAddresses[i];
				amounts[h] += task.funding[funder][token];
				unchecked {
					i ++;
				}
			}
			unchecked {
				h ++;
			}
		}
		return (task.fundingType, amounts);
	}

	// Governance
	function adjustTakeRate(uint8 takeRate) external onlyOwner {
		if (takeRate > maxProtocolTakeRate) {
			revert ExceedsLimit();
		}
		protocolTakeRate = takeRate;

		emit TakeRateAdjusted(takeRate);
	}
	
	function permanentlyLowerMaxTakeRate(uint8 takeRate) external onlyOwner {
		if (takeRate > maxProtocolTakeRate) {
			revert ExceedsLimit();
		}
		maxProtocolTakeRate = takeRate;
		// If the current protocol take rate is greater than the new max then adjust it
		if (protocolTakeRate > takeRate){
			protocolTakeRate = takeRate;
			emit TakeRateAdjusted(takeRate);
		}

		emit MaxTakeRateLowered(takeRate);
	}

	function adjustUnlockPeriod(uint32 _unlockPeriod) external onlyOwner {
		unlockPeriod = _unlockPeriod;

		emit UnlockPeriodAdjusted(unlockPeriod);
	}

	function adjustProtocolAddress(address _protocolAddress) external onlyOwner {
		protocolAddress = _protocolAddress;
		emit ProtocolAddressAdjusted(_protocolAddress);
	}

	function withdrawStuckTokens(address tokenAddress) external onlyOwner {
		uint trackedBalance = totalTokenBalance[tokenAddress];
		if (tokenAddress == address(0)) {
			uint inContract = address(this).balance;
			uint stuck = inContract - trackedBalance;
			(bool sent,) = owner().call{value: stuck}("");
			if (!sent) {
				revert FailedToSend();
			}
		} else {
			IERC20 token = IERC20(tokenAddress);
			uint inContract = token.balanceOf(address(this));
			uint stuck = inContract - trackedBalance;
			token.safeTransfer(owner(), stuck);
		}
	}

	receive() external payable {}
	fallback() external payable {}
}