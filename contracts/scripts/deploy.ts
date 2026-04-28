import { ethers } from "hardhat";

async function main() {
  const Registry = await ethers.getContractFactory("MintAIRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`MintAIRegistry deployed to: ${address}`);
  console.log(`Set MINTAI_CONTRACT_ADDRESS=${address} in server/.env`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
