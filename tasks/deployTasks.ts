import { task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

task("deploy-all").setAction(async (taskArguments, hre, runSuper) => {
  await hre.run("clean-compile");
  await hre.run("deploy-inheritance");
});

task("deploy-inheritance", "Deploy Inheritance contracts").setAction(async (taskArguments, hre, runSuper) => {
  try {
    console.log("Deploying Inheritance...");
    const contract = await hre.ethers.deployContract("Inheritance");
    await contract.waitForDeployment();
    console.log("Contract deployed to:", await contract.getAddress());
  } catch (error) {
    console.error(error);
  }
});

task("clean-compile", "Cleans the cache, deletes all artifacts, and compiles the contracts").setAction(
  async (taskArguments, hre) => {
    console.log("Cleaning...");
    await hre.run("clean");

    console.log("Compiling...");
    await hre.run("compile");
  }
);
