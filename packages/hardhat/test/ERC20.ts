import { ERC20Token } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Token contract", function () {
  let Token;
  let token: ERC20Token;
  let owner: SignerWithAddress;
  let buyer: SignerWithAddress;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("ERC20Token");
    token = (await Token.deploy("TokenCoin", "TKCN", 18, 1000)) as ERC20Token;
    [owner, buyer] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.balanceOf(owner.address)).to.equal(1000);
    });

    it("Should set the total supply", async function () {
      expect(await token.totalSupply()).to.equal(1000);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      await token.transfer(buyer.address, 100);
      expect(await token.balanceOf(owner.address)).to.equal(900);
      expect(await token.balanceOf(buyer.address)).to.equal(100);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);

      await expect(token.transfer(buyer.address, 10000)).to.be.revertedWithCustomError(
        token,
        "ERC20InsufficientBalance",
      );

      expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should update allowance", async function () {
      await token.approve(buyer.address, 100);
      expect(await token.allowance(owner.address, buyer.address)).to.equal(100);
    });

    it("Should transfer tokens from one account to another with allowance", async function () {
      await token.approve(buyer.address, 100);
      const allowance = await token.allowance(owner.address, buyer.address);
      const tokenContractAsBuyer = token.connect(buyer);
      await tokenContractAsBuyer.transferFrom(owner.address, buyer.address, allowance, { from: buyer.address });

      expect(await token.balanceOf(owner.address)).to.equal(900);
      expect(await token.balanceOf(buyer.address)).to.equal(100);
      expect(await token.allowance(owner.address, buyer.address)).to.equal(0);
    });

    it("Should fail if sender doesn’t have enough allowance", async function () {
      await token.approve(buyer.address, 99);

      await expect(token.transferFrom(owner.address, buyer.address, 100)).to.be.revertedWithCustomError(
        token,
        "ERC20InsufficientAllowance",
      );
    });
  });
});
