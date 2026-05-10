import { network } from "hardhat"

async function deploy() {
  const { ethers } = await network.connect({ network: "amoy" })
  const c = await ethers.deployContract("ContractAgreement")
  await c.waitForDeployment()
  console.log("Deployed at:", c.target)
}

deploy().catch(console.error)