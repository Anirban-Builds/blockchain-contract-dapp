import { HardhatUserConfig } from "hardhat/config"
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers"
import * as dotenv from "dotenv"
dotenv.config()

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    version: "0.8.28",
  },
  networks: {
    amoy: {
      type: "http",
      url: process.env.RPC_URL!,
      accounts: [process.env.AMOY_KEY!]
    } as any
  },
  paths: {
    sources: "./src/contracts"
  }
}

export default config