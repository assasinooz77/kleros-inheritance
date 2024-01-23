import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Inheritance", () => {
  let deployer: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let contract: any;

  before(async () => {
    [deployer, user] = await ethers.getSigners();
  });

  it("should deploy contract successfully", async () => {
    contract = await ethers.deployContract("Inheritance");
    await contract.waitForDeployment();
    expect(await contract.owner()).to.eq(deployer.address);
  });

  it("should only allow the owner to call setHeir", async () => {
    await contract.connect(user).setHeir(user.address);
    expect(await contract.heir()).not.to.eq(user.address);
  });

  it("should set the heir successfully", async () => {
    await expect(contract.setHeir(user.address))
      .to.emit(contract, "HeirChanged")
      .withArgs(ethers.ZeroAddress, user.address);
    expect(await contract.heir()).to.eq(user.address);
  });

  it("should send ETH to contract successfully", async () => {
    await deployer.sendTransaction({ to: await contract.getAddress(), value: ethers.parseEther("100") });
    const balance = await ethers.provider.getBalance(await contract.getAddress());
    expect(balance).to.eq(ethers.parseEther("100"));
  });

  it("should only allow the owner to call withdraw", async () => {
    contract.connect(user).withdraw(ethers.parseEther("1"));
    const balance = await ethers.provider.getBalance(await contract.getAddress());
    expect(balance).to.eq(ethers.parseEther("100"));
  });

  it("should withdraw 1 ETH successfully", async () => {
    await expect(contract.withdraw(ethers.parseEther("1")))
      .to.emit(contract, "Withdraw")
      .withArgs(deployer.address, ethers.parseEther("1"));
    const balance = await ethers.provider.getBalance(await contract.getAddress());
    expect(balance).to.eq(ethers.parseEther("99"));
  });

  it("should withdraw 0 ETH successfully", async () => {
    await expect(contract.withdraw(ethers.parseEther("0")))
      .to.emit(contract, "Withdraw")
      .withArgs(deployer.address, ethers.parseEther("0"));
    const balance = await ethers.provider.getBalance(await contract.getAddress());
    expect(balance).to.eq(ethers.parseEther("99"));
  });

  it("should not be able to withdraw with owner after 1 month", async () => {
    await mine(30 * 24 * 60 + 1, { interval: 60 });
    contract.withdraw(ethers.parseEther("1"));
    const balance = await ethers.provider.getBalance(await contract.getAddress());
    expect(balance).to.eq(ethers.parseEther("99"));
  });

  it("should withdraw with the heir and update the owner after 1 month", async () => {
    await expect(contract.connect(user).withdraw(ethers.parseEther("1")))
      .to.emit(contract, "Withdraw")
      .withArgs(user.address, ethers.parseEther("1"));
    const balance = await ethers.provider.getBalance(await contract.getAddress());
    expect(balance).to.eq(ethers.parseEther("98"));
    expect(await contract.owner()).to.eq(user.address);
  });

  it("should setHeir with the new owner after 1 month", async () => {
    await expect(contract.connect(user).setHeir(deployer.address))
      .to.emit(contract, "HeirChanged")
      .withArgs(user.address, deployer.address);
    expect(await contract.heir()).to.eq(deployer.address);
  });
});
