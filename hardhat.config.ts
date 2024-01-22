import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

import "./tasks";

interface Environment {
  GOERLI_RPC_URL: string;
  ETHEREUM_RPC_URL: string;
  PRIVATE_KEY: string;
  ETHERSCAN_API_KEY: string;
}

const env: Environment = {
  GOERLI_RPC_URL: process.env.GOERLI_RPC_URL ?? "",
  ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL ?? "",
  PRIVATE_KEY: process.env.PRIVATE_KEY ?? "",
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY ?? "",
};

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      forking: {
        url: env.ETHEREUM_RPC_URL,
        blockNumber: 18000000,
      },
    },
    goerli: {
      url: env.GOERLI_RPC_URL,
      accounts: env.PRIVATE_KEY.length > 0 ? [env.PRIVATE_KEY] : [],
    },
  },
  sourcify: {
    enabled: true,
  },
  etherscan: {
    apiKey: env.ETHERSCAN_API_KEY,
  },
};

export default config;
