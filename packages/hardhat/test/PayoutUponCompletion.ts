import { expect } from "chai";
import { ethers } from "hardhat";
const { id } = ethers.utils;
import { PayoutUponCompletion } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ContractReceipt } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ERC20Token } from "../typechain-types/contracts/ERC20Token.sol";
import { JsonRpcProvider } from "@ethersproject/providers";

const stubs = {
  taskUrl: "taskdescription.com/this-task",
  zeroAddr: "0x0000000000000000000000000000000000000000",
  oneEther: parseUnits("1", "ether"),
};

const helperMethods = {
  taskArrayToObject: (taskArr: [string, number, string, string[], string[], BigNumber, boolean, boolean, boolean]) => {
    return {
      reviewer: taskArr[0],
      reviewerPercentage: taskArr[1],
      approvedWorker: taskArr[2],
      fundingType: taskArr[3],
      funderAddresses: taskArr[4],
      creationTime: taskArr[5],
      approved: taskArr[6],
      canceled: taskArr[7],
      complete: taskArr[8],
    };
  },
  fundingArrayToObject: (fundingArr: [string[], BigNumber[]]) => {
    const obj = {} as { [key: string]: BigNumber };
    const tokens = fundingArr[0];
    const amounts = fundingArr[1];
    for (const index in tokens) {
      const token = tokens[index];
      const amount = amounts[index];
      obj[token] = amount;
    }
    return obj;
  },
};
describe("PayoutUponCompletion", function () {
  let payoutUponCompletion: PayoutUponCompletion;
  let tokenUno: ERC20Token;
  let tokenDos: ERC20Token;
  let provider: JsonRpcProvider;
  let owner: SignerWithAddress;
  let reviewer: SignerWithAddress;
  let worker: SignerWithAddress;
  let funder: SignerWithAddress;
  before(async () => {
    provider = ethers.provider;
    [owner, reviewer, worker, funder] = await ethers.getSigners();
    const payoutUponCompletionFactory = await ethers.getContractFactory("PayoutUponCompletion");
    payoutUponCompletion = (await payoutUponCompletionFactory.deploy(50, owner.address)) as PayoutUponCompletion;
    await payoutUponCompletion.deployed();
    // Create some tokens to use for testing
    const erc20Factory = await ethers.getContractFactory("ERC20Token");
    tokenUno = (await erc20Factory.deploy("UnoCoin", "UNO", 18, parseUnits("10000", "ether"))) as ERC20Token;
    await tokenUno.deployed();
    tokenDos = (await erc20Factory.deploy("DosCoin", "DOS", 6, parseUnits("10000", "ether"))) as ERC20Token;
    await tokenDos.deployed();
    // Give funder account some tokens
    await tokenUno.transfer(funder.address, parseUnits("100", "ether"));
    await tokenDos.transfer(funder.address, parseUnits("100", "ether"));
  });

  describe("Deployment", function () {
    it("Should have the right owner", async function () {
      expect(await payoutUponCompletion.owner()).to.equal(owner.address);
    });

    it("Should have the right protocol percentage", async function () {
      expect(await payoutUponCompletion.protocolTakeRate()).to.equal(50);
    });
  });

  describe("Creating Tasks", function () {
    it("Should be able to create task", async function () {
      const tx = await payoutUponCompletion.createTask(stubs.taskUrl, reviewer.address, 0);
      const receipt: ContractReceipt = await tx.wait();
      expect(receipt.events).to.exist;
      expect(receipt.events?.length).to.equal(1);
      const taskCreatedEvent = receipt.events?.filter(e => e.event == "TaskCreated")[0];
      expect(taskCreatedEvent).to.exist;
      const taskIndex = taskCreatedEvent?.args?.[0];
      expect(taskIndex).to.exist;

      const taskArr = await payoutUponCompletion.getTask(taskIndex);
      const task = helperMethods.taskArrayToObject(taskArr);
      expect(task).to.exist;
      expect(task.reviewer).to.equal(reviewer.address);
      expect(task.reviewerPercentage).to.equal(0);
      expect(task.creationTime.toNumber()).to.be.gt(0);
      expect(task.funderAddresses.length).to.equal(0);
      expect(task.fundingType.length).to.equal(0);
      expect(task.approvedWorker).to.equal(stubs.zeroAddr);
      expect(task.approved).to.equal(false);
      expect(task.canceled).to.equal(false);
      expect(task.complete).to.equal(false);
    });

    it("Should be able to create and fund task with ETH", async function () {
      const beforeBalance = await provider.getBalance(payoutUponCompletion.address);
      const tx = await payoutUponCompletion.createAndFundTask(
        stubs.taskUrl,
        reviewer.address,
        0,
        stubs.oneEther,
        stubs.zeroAddr,
        { value: stubs.oneEther },
      );
      const receipt: ContractReceipt = await tx.wait();
      expect(receipt.events).to.exist;
      expect(receipt.events?.length).to.equal(2);
      const taskCreatedEvent = receipt.events?.filter(e => e.event == "TaskCreated")[0];
      const taskFundedEvent = receipt.events?.filter(e => e.event == "TaskFunded")[0];
      expect(taskCreatedEvent).to.exist;
      expect(taskFundedEvent).to.exist;
      const taskIndex = taskCreatedEvent?.args?.[0];
      expect(taskIndex).to.exist;
      const taskArr = await payoutUponCompletion.getTask(taskCreatedEvent?.args?.[0]);
      const task = helperMethods.taskArrayToObject(taskArr);
      expect(task).to.exist;
      expect(task.reviewer).to.equal(reviewer.address);
      expect(task.reviewerPercentage).to.equal(0);
      expect(task.creationTime.toNumber()).to.be.gt(0);
      expect(task.funderAddresses.length).to.equal(1);
      expect(task.fundingType.length).to.equal(1);
      expect(task.approvedWorker).to.equal(stubs.zeroAddr);
      expect(task.approved).to.equal(false);
      expect(task.canceled).to.equal(false);
      expect(task.complete).to.equal(false);

      const afterBalance = await provider.getBalance(payoutUponCompletion.address);
      expect(afterBalance.sub(beforeBalance).toString()).to.equal(stubs.oneEther.toString());
    });

    it("Should be able to create and fund task with an ERC20", async function () {
      const beforeBalance = await tokenUno.balanceOf(payoutUponCompletion.address);
      await tokenUno.approve(payoutUponCompletion.address, stubs.oneEther);
      const tx = await payoutUponCompletion.createAndFundTask(
        stubs.taskUrl,
        reviewer.address,
        0,
        stubs.oneEther,
        tokenUno.address,
      );
      const receipt: ContractReceipt = await tx.wait();
      expect(receipt.events).to.exist;
      expect(receipt.events?.length).to.equal(3);
      const taskCreatedEvent = receipt.events?.filter(e => e.event == "TaskCreated")[0];
      const taskFundedEvent = receipt.events?.filter(e => e.event == "TaskFunded")[0];
      const tokenTransfer = receipt.events?.filter(e => e.topics[0] == id("Transfer(address,address,uint256)"))[0];
      expect(taskCreatedEvent).to.exist;
      expect(taskFundedEvent).to.exist;
      expect(tokenTransfer).to.exist;
      const taskIndex = taskCreatedEvent?.args?.[0];
      expect(taskIndex).to.exist;
      const taskArr = await payoutUponCompletion.getTask(taskCreatedEvent?.args?.[0]);
      const task = helperMethods.taskArrayToObject(taskArr);
      expect(task).to.exist;
      expect(task.reviewer).to.equal(reviewer.address);
      expect(task.reviewerPercentage).to.equal(0);
      expect(task.creationTime.toNumber()).to.be.gt(0);
      expect(task.funderAddresses.length).to.equal(1);
      expect(task.fundingType.length).to.equal(1);
      expect(task.approvedWorker).to.equal(stubs.zeroAddr);
      expect(task.approved).to.equal(false);
      expect(task.canceled).to.equal(false);
      expect(task.complete).to.equal(false);

      const afterBalance = await tokenUno.balanceOf(payoutUponCompletion.address);
      expect(afterBalance.sub(beforeBalance).toString()).to.equal(stubs.oneEther.toString());
    });
  });

  describe("Funding Tasks", function () {
    let taskIndex: BigNumber;
    before(async () => {
      const tx = await payoutUponCompletion.createTask(stubs.taskUrl, reviewer.address, 0);
      const receipt: ContractReceipt = await tx.wait();
      expect(receipt.events).to.exist;
      expect(receipt.events?.length).to.equal(1);
      const taskCreatedEvent = receipt.events?.filter(e => e.event == "TaskCreated")[0];
      expect(taskCreatedEvent).to.exist;
      taskIndex = taskCreatedEvent?.args?.[0];
      expect(taskIndex).to.exist;
    });

    it("Should be able to fund a created task with ETH", async function () {
      const beforeContractBalance = await provider.getBalance(payoutUponCompletion.address);
      const beforeFunderBalance = await funder.getBalance();
      const payoutContractFunder = payoutUponCompletion.connect(funder);
      await payoutContractFunder.fundTask(taskIndex, stubs.oneEther, stubs.zeroAddr, { value: stubs.oneEther });
      const taskArr = await payoutUponCompletion.getTask(taskIndex);
      const task = helperMethods.taskArrayToObject(taskArr);
      expect(task).to.exist;
      expect(task.reviewer).to.equal(reviewer.address);
      expect(task.reviewerPercentage).to.equal(0);
      expect(task.creationTime.toNumber()).to.be.gt(0);
      expect(task.funderAddresses.length).to.equal(1);
      expect(task.fundingType.length).to.equal(1);
      expect(task.approvedWorker).to.equal(stubs.zeroAddr);
      expect(task.approved).to.equal(false);
      expect(task.canceled).to.equal(false);
      expect(task.complete).to.equal(false);

      const taskFunding = await payoutUponCompletion.getTaskFunding(taskIndex);
      expect(taskFunding.length).to.equal(2);
      const funding = helperMethods.fundingArrayToObject(taskFunding);
      expect(funding[stubs.zeroAddr]).to.equal(stubs.oneEther);

      const afterContractBalance = await provider.getBalance(payoutUponCompletion.address);
      expect(afterContractBalance.sub(beforeContractBalance).toString()).to.equal(stubs.oneEther.toString());
      const afterFunderBalance = await funder.getBalance();
      expect(beforeFunderBalance.sub(afterFunderBalance).toBigInt()).to.be.gt(stubs.oneEther.toBigInt());
    });

    it("Should be able to fund a created task with an ERC20", async function () {
      const beforeContractBalance = await tokenUno.balanceOf(payoutUponCompletion.address);
      const beforeFunderBalance = await tokenUno.balanceOf(funder.address);
      const tokenUnoFunder = tokenUno.connect(funder);
      await tokenUnoFunder.approve(payoutUponCompletion.address, stubs.oneEther);

      const payoutContractFunder = payoutUponCompletion.connect(funder);
      await payoutContractFunder.fundTask(taskIndex, stubs.oneEther, tokenUno.address);

      const taskArr = await payoutUponCompletion.getTask(taskIndex);
      const task = helperMethods.taskArrayToObject(taskArr);
      expect(task).to.exist;
      expect(task.reviewer).to.equal(reviewer.address);
      expect(task.reviewerPercentage).to.equal(0);
      expect(task.creationTime.toNumber()).to.be.gt(0);
      expect(task.funderAddresses.length).to.equal(1);
      expect(task.fundingType.length).to.equal(2);
      expect(task.approvedWorker).to.equal(stubs.zeroAddr);
      expect(task.approved).to.equal(false);
      expect(task.canceled).to.equal(false);
      expect(task.complete).to.equal(false);

      const taskFunding = await payoutUponCompletion.getTaskFunding(taskIndex);
      expect(taskFunding.length).to.equal(2);
      const funding = helperMethods.fundingArrayToObject(taskFunding);
      expect(funding[tokenUno.address]).to.equal(stubs.oneEther);

      const afterContractBalance = await tokenUno.balanceOf(payoutUponCompletion.address);
      expect(afterContractBalance.sub(beforeContractBalance).toString()).to.equal(stubs.oneEther.toString());
      const afterFunderBalance = await tokenUno.balanceOf(funder.address);
      expect(beforeFunderBalance.sub(afterFunderBalance).toBigInt()).to.equal(stubs.oneEther.toBigInt());
    });
  });

  describe("Payouts Flow", function () {
    worker;
  });
});
