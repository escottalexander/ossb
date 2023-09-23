//SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// Use openzeppelin to inherit battle-tested implementations
import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PayoutUponCompletion
 * @dev This contract manages tasks that lead to a payout to a particular address when the work is approved by the approver.
 * @author escottalexander
 */
contract PayoutUponCompletion is Ownable2Step {
	using SafeERC20 for IERC20;

	struct Task {
		address approvedWorker; // The worker who is able to claim funds when approved, can be set before or after work is submitted
		uint creationTime; // Include this to refund users after certain time has passed
		address reviewer; // The one who can determine if this task has been completed, able to set to approved or canceled status
		uint8 reviewerPercentage; // Percentage of funds that go to reviewer, set at creation, payed out when worker claims funds
		bool approved; // Has task been reviewed and accepted, worker can be payed out
		bool canceled; // Everyone is refunded when a task moves to this state
		bool complete; // All funds have been allocated
	}

	// constant variables
	uint8 constant oneHundred = 100;
	uint16 constant tenThousand = 10000;

	// State Variables
	uint16 public protocolTakeRateBps; // Percentage that protocol takes from every bounty claim
	uint16 public maxProtocolTakeRateBps = 500; // Protocol won't be able to take more than this / 10000 of a bounty - 5% at default level - and this can never be modified upwards
	uint32 public unlockPeriod = 63072000; // Two years in seconds - Anyone can cancel a task after this time period - uint32 maximimum is 136 years
	uint public currentTaskIndex;

	// Token AllowList Variables
	mapping(address => bool) isTokenAllowed;

	// Token balance mappings
	mapping(address => mapping(address => uint)) withdrawableFunds; // fundOwner => tokenAddress => amount, can be withdrawn by fundOwner at anytime
	mapping(address => uint) totalUserTokenBalance;

	// Task specific mappings
	mapping(uint => Task) public tasks;
	mapping(uint => mapping(address => uint)) totalTaskFunding; // TaskId => TokenAddress => amount deposited - zero address for ETH - can be derived from funding below
	mapping(uint => mapping(address => mapping(address => uint))) taskFunding; // TaskId => FunderAddress => tokenAddress => amount
	mapping(uint => uint) taskTally; // Just used to compare token amounts (regardless of type) so we can prove all have been included

	// Events
	event TaskCreated(
		uint indexed index,
		string taskLocation,
		address reviewer
	);
	event TaskFunded(uint indexed index, address funder, uint amount, address token);
	event TaskCanceled(uint indexed index);
	event TaskApproved(uint indexed index, address worker);
	event TaskFinalized(uint indexed index);
	event Withdraw(address indexed receiver, uint amount, address token);
	event WorkSubmitted(
		uint indexed index,
		address worker,
		string workLocation
	);
	event ApprovedWorkerSet(uint indexed index, address worker);

	// Governance Events
	event AllowListChanged(address token, bool allowed);
	event TakeRateAdjusted(uint16 takeRate);
	event MaxTakeRateLowered(uint16 maxTakeRate);
	event UnlockPeriodAdjusted(uint32 unlockPeriod);

	// Errors
	error NotAuthorized();
	error ZeroAddressNotAllowed();
	error TaskDoesNotExist();
	error TaskInFinalState();
	error WorkNotApproved();
	error ExceedsLimit();
	error FailedToSend();
	error InvalidAmount();
	error TokenNotAllowed();

	/**
	 * @dev Constructor to set the initial protocol take rate and protocol address.
	 * @param _protocolTakeRate initial rate taken by the protocol.
	 */
	constructor(uint8 _protocolTakeRate) {
		if (_protocolTakeRate > maxProtocolTakeRateBps) {
			revert ExceedsLimit();
		}
		protocolTakeRateBps = _protocolTakeRate;
		// Enable ETH by default
		isTokenAllowed[address(0)] = true;
	}

	/**
	 * @notice Does parameter checking in the internal method _createTask
	 * @dev Creates a new task.
	 * @param taskLocation a string representing the location (url, ipfs, etc.) for the task.
	 * @param reviewer the address of the individual responsible for reviewing the task.
	 * @param reviewerPercentage percentage of the funds allocated to the reviewer when task is completed.
	 */
	function createTask(
		string memory taskLocation,
		address reviewer,
		uint8 reviewerPercentage
	) external returns (uint) {
		return _createTask(taskLocation, reviewer, reviewerPercentage);
	}

	/**
	 * @notice Does parameter checking in the internal method _createTask
	 * @dev Creates a new task and funds it.
	 * @param taskLocation a string representing the location (url, ipfs, etc.) for the task.
	 * @param reviewer the address of the individual responsible for reviewing the task.
	 * @param reviewerPercentage percentage of the funds allocated to the reviewer when task is completed.
	 * @param amount the amount to fund the task with initially.
	 * @param token the address of the token (or address(0) for ETH) to fund the task with initially.
	 */
	function createAndFundTask(
		string memory taskLocation,
		address reviewer,
		uint8 reviewerPercentage,
		uint amount,
		address token
	) external payable returns (uint) {
		uint index = _createTask(taskLocation, reviewer, reviewerPercentage);
		_fundTask(index, amount, token);
		return index;
	}

	/**
	 * @dev Funds a task.
	 * @param taskIndex the index of the task to fund.
	 * @param amount the amount to fund the task with initially.
	 * @param token the address of the token (or address(0) for ETH) to fund the task with initially.
	 */
	function fundTask(
		uint taskIndex,
		uint amount,
		address token
	) external payable {
		if (currentTaskIndex <= taskIndex) {
			revert TaskDoesNotExist();
		}
		_fundTask(taskIndex, amount, token);
	}

	/**
	 * @notice Allows a user to withdraw their available funds (ETH or tokens) from the contract.
	 * @dev The function checks that the withdrawal amount does not exceed the user's available balance. The internal state is then updated to reduce the balance of the user by the withdrawal amount and decrease the total balance of the respective token. Depending on the token address, it facilitates either ETH or ERC20 token transfer.
	 * @param amount The amount of funds the user wishes to withdraw.
	 * @param tokenAddress The address of the token contract for ERC20 withdrawals; use the zero address for ETH withdrawals.
	 */
	function withdraw(uint amount, address tokenAddress) external {
		if (amount > withdrawableFunds[msg.sender][tokenAddress]) {
			revert ExceedsLimit();
		}
		// We can use unchecked math here since we just verified that it doesn't exceed
		unchecked {
			withdrawableFunds[msg.sender][tokenAddress] -= amount;
		}
		// Remove funds from total balance mapping
		totalUserTokenBalance[tokenAddress] -= amount;
		if (tokenAddress == address(0)) {
			// ETH
			(bool sent, ) = payable(msg.sender).call{ value: amount }("");
			if (!sent) {
				revert FailedToSend();
			}
		} else {
			IERC20(tokenAddress).safeTransfer(msg.sender, amount);
		}

		emit Withdraw(msg.sender, amount, tokenAddress);
	}

	/**
	 * @notice Internal function to create a new task.
	 * @dev This function will initialize a new task with the given details. This is an internal function and can only be called by other functions within this contract.
	 * @param taskLocation A string representing the location (url, ipfs, etc.) for the task.
	 * @param reviewer the address of the individual responsible for reviewing the task.
	 * @param reviewerPercentage percentage of the funds allocated to the reviewer when task is completed.
	 */
	function _createTask(
		string memory taskLocation,
		address reviewer,
		uint8 reviewerPercentage
	) internal returns (uint idx) {
		if (reviewer == address(0)) {
			revert ZeroAddressNotAllowed();
		}
		if (reviewerPercentage > oneHundred) {
			revert ExceedsLimit();
		}
		idx = currentTaskIndex;
		Task storage task = tasks[idx];
		task.reviewer = reviewer;
		task.reviewerPercentage = reviewerPercentage;
		task.creationTime = block.timestamp;

		// Increment index for next entry
		currentTaskIndex++;

		// Emit event
		emit TaskCreated(idx, taskLocation, reviewer);

		// returning the idx in case other processes need it to further modify the task
		return idx;
	}

	/**
	 * @notice Internal function to fund a specific task.
	 * @dev This function allows the funding of a task identified by its index. It adjusts the total amount of funds available for the task. This is an internal function and can only be called by other functions within this contract.
	 * @param taskIndex The index of the task to fund.
	 * @param amount The amount of funds to add to the task's total funds.
	 * @param token The address of the token contract for ERC20 withdrawals; use the zero address for ETH withdrawals.
	 */
	function _fundTask(uint taskIndex, uint amount, address token) internal {
		if (!isTokenAllowed[token]) {
			revert TokenNotAllowed();
		}
		Task storage task = tasks[taskIndex];
		if (task.complete || task.canceled) {
			revert TaskInFinalState();
		}
		// Transfer value
		if (token == address(0)) {
			// Must be ETH
			if (amount == 0 || msg.value != amount) {
				revert InvalidAmount();
			}
		} else {
			if (amount == 0) {
				revert InvalidAmount();
			}
			IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
		}
		// Update State
		_addFunds(taskIndex, amount, token);

		emit TaskFunded(taskIndex, msg.sender, amount, token);
	}

	/**
	 * @notice Internal function to add a funder's details and their funding amount to a task.
	 * @dev This function will add the details of a funder and the amount of funds they have provided to a task. This helps in keeping track of who has funded a task and with how much amount. This is an internal function and can only be called by other functions within this contract.
	 * @param taskIndex The taskIndex to which the funder and funds are being added.
	 * @param amount The amount of funds provided by the funder.
	 * @param token The address of the token contract for ERC20 withdrawals; use the zero address for ETH withdrawals.
	 */
	function _addFunds(
		uint taskIndex,
		uint amount,
		address token
	) internal {
		// Add funds to task
		taskFunding[taskIndex][msg.sender][token] += amount;
		totalTaskFunding[taskIndex][token] += amount;
		taskTally[taskIndex] += amount;
		// Add funds to total balance mapping
		totalUserTokenBalance[token] += amount;
	}

	/**
	 * @notice This method is included to create a wholistic workflow though offline attestations can accomplish the same thing.
	 * @dev Submits work for a task. This just emits the location for the work so that a reviewer can be made aware and so that there is a immutable record of when the work was submitted and by whom.
	 * @param taskIndex the index of the task to submit work for.
	 * @param workLocation the location (url, ipfs, etc) where the work can be found or reviewed.
	 */
	function submitWork(uint taskIndex, string calldata workLocation) external {
		if (currentTaskIndex <= taskIndex) {
			revert TaskDoesNotExist();
		}
		Task storage task = tasks[taskIndex];
		if (task.complete || task.canceled) {
			revert TaskInFinalState();
		}
		emit WorkSubmitted(taskIndex, msg.sender, workLocation);
	}

	/**
	* @dev Cancel a task and refund the contributors. Only the reviewer can cancel unless the unlock period has passed, then anyone can cancel.
	* @param taskIndex the index of the task to cancel.
	* @param funderTokenPairs an array containing n 2 item arrays containing a funder (index 0) and a token (index 1) that they used to fund the task. 
			 e.g. [[address, token], [address, token]...]
	*/
	function cancelTask(
		uint taskIndex,
		address[][] calldata funderTokenPairs
	) external {
		if (currentTaskIndex <= taskIndex) {
			revert TaskDoesNotExist();
		}
		Task storage task = tasks[taskIndex];
		if (task.complete || task.canceled) {
			revert TaskInFinalState();
		}
		if (
			msg.sender != task.reviewer &&
			block.timestamp < task.creationTime + unlockPeriod
		) {
			revert NotAuthorized();
		}
		task.canceled = true;
		uint verificationTally; // To make sure all tokens were included in calldata
		// Refund all funders
		for (uint i; i < funderTokenPairs.length; ) {
			uint amount = taskFunding[taskIndex][funderTokenPairs[i][0]][
				funderTokenPairs[i][1]
			];
			verificationTally += amount;
			withdrawableFunds[funderTokenPairs[i][0]][
				funderTokenPairs[i][1]
			] += amount;
			unchecked {
				i++;
			}
		}
		if (verificationTally != taskTally[taskIndex]) {
			revert InvalidAmount();
		}
		emit TaskCanceled(taskIndex);
	}

	/**
	 * @dev Finalize a task, distribute funds to the worker, reviewer, and protocol. Anyone can call this. The task must be in the approved state and otherwise not finalized.
	 * @param taskIndex the index of the task to finalize.
	 * @param fundingTypes an array containing a token addresses that were used to fund the task.
	 */
	function finalizeTask(
		uint taskIndex,
		address[] calldata fundingTypes
	) external {
		Task storage task = tasks[taskIndex];
		if (task.complete || task.canceled) {
			revert TaskInFinalState();
		}
		if (!task.approved) {
			revert WorkNotApproved();
		}
		task.complete = true;
		uint verificationTally; // To make sure all tokens were included in calldata

		for (uint i; i < fundingTypes.length; ) {
			address token = fundingTypes[i];
			uint totalAmount = totalTaskFunding[taskIndex][token];
			_divyUp(
				totalAmount,
				token,
				task.reviewer,
				task.approvedWorker,
				task.reviewerPercentage
			);
			verificationTally += totalAmount;
			unchecked {
				i++;
			}
		}

		if (verificationTally != taskTally[taskIndex]) {
			revert InvalidAmount();
		}

		emit TaskFinalized(taskIndex);
	}

	/**
	* @notice Internal utility function to divide an amount by a divisor.
	* @dev This function divides `amount` by `divisor` taking into account a multiplier to increase precision for small numbers.
	* @param amount The quantity to be divided.
	* @param multiplier The number by which `amount` will be multiplied by.
	* @param scale The number by which `amount` will be divided.
	* @return result of the division, considering the special basis points division or a standard division, depending on the potential for overflow.
	*/
	function _divideWithExtraPrecision (
		uint amount, uint multiplier, uint scale
	)
	internal pure returns (uint) {
		uint a = amount / scale;
		uint b = amount % scale;
		uint c = multiplier / scale;
		uint d = multiplier % scale;

		return a * c * scale + a * d + b * c + b * d / scale;
	}

	/**
	@notice The purpose of the function is to change the withdrawable allocation of each party involved.
	We check if an overflow would occur before performing the multiplication by the protocolRate and reviewerPercentage.
	If one would occur then we do not change the protocol and reviewers allocation and instead give the full amount to
	the worker. We believe this would only occur is someone funded with a malicious token and without these checks it 
	would make it impossible to finalize the task.
	@param amount total amount to distribute
	@param token token address that is being processed
	@param reviewer the task reviewer
	@param worker the address that completed the task
	@param reviewerPercentage percentage to allocate to the reviewer
	*/
	function _divyUp(
		uint amount,
		address token,
		address reviewer,
		address worker,
		uint reviewerPercentage
	) internal {
		uint protocolShare;
		uint reviewerShare;
		if (protocolTakeRateBps > 0) {
			// By dividing by 10000 this allows us to adjust the take rate to be as granular as 0.01%
			protocolShare = _divideWithExtraPrecision(
				amount, protocolTakeRateBps,
				tenThousand
			);
			// Remove from totalUserTokenBalance so we can remove from contract
			totalUserTokenBalance[token] -= protocolShare;
		}
		if (reviewerPercentage > 0) {
			reviewerShare = _divideWithExtraPrecision(
				amount - protocolShare, reviewerPercentage * oneHundred,
				tenThousand
			);
			// Allocate to reviewer
			withdrawableFunds[reviewer][token] += reviewerShare;
		}
		// Allocate remaining to worker
		uint workerShare = amount - protocolShare - reviewerShare;
		withdrawableFunds[worker][token] += workerShare;
	}

	// Reviewer only functions

	/**
	 * @notice Approves a worker for a specified task, updating the task's state and emitting a TaskApproved event.
	 * @dev Only the task reviewer is authorized to approve a worker for a task. It reverts if called by any other address or if the approved worker's address is the zero address. This function modifies the state by updating the `approvedWorker` and `approved` attributes of the task.
	 * @param taskIndex The index of the task in the tasks array.
	 * @param approvedWorker The address of the worker being approved for the task.
	 */
	function approveTask(uint taskIndex, address approvedWorker) external {
		Task storage task = tasks[taskIndex];
		if (task.complete || task.canceled) {
			revert TaskInFinalState();
		}
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

	/**
	 * @notice Set the approved worker for a specified task.
	 * @dev Only the task reviewer can call this function to set the approved worker for a task, reverting if called by any other address. It modifies the task's state by updating the `approvedWorker` attribute.
	 * @param taskIndex The index of the task in the tasks array.
	 * @param approvedWorker The address of the worker to be set as the approved worker for the task.
	 */
	function setApprovedWorker(
		uint taskIndex,
		address approvedWorker
	) external {
		Task storage task = tasks[taskIndex];
		if (task.complete || task.canceled) {
			revert TaskInFinalState();
		}
		if (msg.sender != task.reviewer) {
			revert NotAuthorized();
		}
		if (approvedWorker == address(0)) {
			revert ZeroAddressNotAllowed();
		}
		task.approvedWorker = approvedWorker;

		emit ApprovedWorkerSet(taskIndex, approvedWorker);
	}

	// View Functions

	/**
	 * @dev Returns the withdrawable balance of the caller for a given token.
	 * @param token the address of the token (or 0 for ETH).
	 * @return the amount of the token (or ETH) that the caller can withdraw.
	 */
	function getWithdrawableBalance(
		address token
	) external view returns (uint) {
		return withdrawableFunds[msg.sender][token];
	}

	/**
	 * @notice Retrieves detailed information about a specific task.
	 * @dev Retrieves a task using the provided index and returns various details about the task.
	 * @param taskIndex The index of the task to retrieve information for.
	 * @return Task The task at that index in the mapping
	 */
	function getTask(
		uint taskIndex
	) external view returns (Task memory) {
		Task storage task = tasks[taskIndex];
		return task;
	}

	/**
	 * @notice Retrieves the funding details for a specific task.
	 * @dev Iterates over all funders and their respective funding tokens to calculate the total funding amount per token.
	 * @param taskIndex The index of the task to retrieve funding details for.
	 * @param tokens An array of token addresses to retrieve the amounts for.
	 * @return tokens An array of addresses representing the different funding tokens for the task.
	 * @return amounts An array of numbers representing the total amount funded per funding type.
	 * @return wasAllTokens A Bool to let you know if all the tokens for the task were returned or not.
	 */
	function getTaskFunding(
		uint taskIndex,
		address[] calldata tokens
	) external view returns (address[] memory, uint[] memory, bool) {
		if (currentTaskIndex <= taskIndex) {
			revert TaskDoesNotExist();
		}

		uint[] memory amounts = new uint[](tokens.length);
		uint verificationTally;
		for (uint i; i < tokens.length; ) {
			uint amount = totalTaskFunding[taskIndex][tokens[i]];
			verificationTally += amount;
			amounts[i] += amount;
			unchecked {
				i++;
			}
		}

		bool wasAllTokens = verificationTally == taskTally[taskIndex];

		return (tokens, amounts, wasAllTokens);
	}

	// Governance Functions

	/**
	 * @notice Updates the allow list status of a specific token.
	 * @dev This function can only be called by the owner of the contract. It updates the allowlist status of the specified token in the contract's state.
	 * @param token The address of the token to be updated.
	 * @param allowed A bool to set for the status of the token; true to allow, false to disallow.
	 */
	function updateTokenAllowList(
		address token,
		bool allowed
	) external onlyOwner {
		isTokenAllowed[token] = allowed;

		emit AllowListChanged(token, allowed);
	}

	/**
	 * @notice Adjusts the protocol take rate to the specified value.
	 * @dev Can only be called by the contract owner. The new take rate cannot exceed the maximum allowed take rate defined by maxProtocolTakeRate.
	 * @param takeRate The new take rate to set, represented as a uint8.
	 */
	function adjustTakeRate(uint16 takeRate) external onlyOwner {
		if (takeRate > maxProtocolTakeRateBps) {
			revert ExceedsLimit();
		}
		protocolTakeRateBps = takeRate;

		emit TakeRateAdjusted(takeRate);
	}

	/**
	 * @notice Permanently lowers the maximum allowable protocol take rate.
	 * @dev Can only be called by the contract owner. The new max take rate must not exceed the current max take rate. If the current protocol take rate is higher than the new max take rate, it will be adjusted accordingly.
	 * @param takeRate The new max take rate to set, represented as a uint8.
	 */
	function permanentlyLowerMaxTakeRate(uint16 takeRate) external onlyOwner {
		if (takeRate > maxProtocolTakeRateBps) {
			revert ExceedsLimit();
		}
		maxProtocolTakeRateBps = takeRate;
		// If the current protocol take rate is greater than the new max then adjust it too
		if (protocolTakeRateBps > takeRate) {
			protocolTakeRateBps = takeRate;
			emit TakeRateAdjusted(takeRate);
		}

		emit MaxTakeRateLowered(takeRate);
	}

	/**
	 * @notice Adjusts the unlock period duration.
	 * @dev Can only be called by the contract owner. This function allows the owner to adjust the duration of the unlock period at any time.
	 * @param _unlockPeriod The new unlock period duration, represented as a uint32.
	 */
	function adjustUnlockPeriod(uint32 _unlockPeriod) external onlyOwner {
		unlockPeriod = _unlockPeriod;

		emit UnlockPeriodAdjusted(unlockPeriod);
	}

	/**
	 * @notice Allows the owner to withdraw protocol tokens (ERC-20 or native Ether) from the contract.
	 * @dev Can only be called by the contract owner. The method gets protocol tokens by subtracting the tracked user balance from the total balance held by the contract, and transfers this amount to the owner.
	 * @param tokenAddress The address of the token to withdraw; use the zero address for native Ether.
	 */
	function withdrawProtocolTokens(address tokenAddress) external onlyOwner {
		uint trackedBalance = totalUserTokenBalance[tokenAddress];
		if (tokenAddress == address(0)) {
			// Compare how much is in contract vs how much is in user balances
			uint inContract = address(this).balance;
			uint protocolBalance = inContract - trackedBalance;
			// The difference is protocol revenue
			if (protocolBalance > 0) {
				(bool sent, ) = payable(owner()).call{ value: protocolBalance }("");
				if (!sent) {
					revert FailedToSend();
				}
			}
		} else {
			IERC20 token = IERC20(tokenAddress);
			// Compare how much is in contract vs how much is in user balances
			uint inContract = token.balanceOf(address(this));
			uint protocolBalance = inContract - trackedBalance;
			// The difference is protocol revenue
			if (protocolBalance > 0) {
				token.safeTransfer(owner(), protocolBalance);
			}
		}
	}
}
