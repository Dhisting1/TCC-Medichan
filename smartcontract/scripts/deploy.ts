import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);

  console.log("Account balance:", ethers.formatEther(balance));

  const Contract = await ethers.getContractFactory("MediChainPrescription");

  const contract = await Contract.deploy(deployer.address);

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("MediChainPrescription deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
