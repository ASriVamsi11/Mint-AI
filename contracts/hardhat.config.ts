import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    calibration: {
      url: process.env.FEVM_RPC_URL || "https://api.calibration.node.glif.io/rpc/v1",
      chainId: 314159,
      accounts:
        process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66
          ? [process.env.PRIVATE_KEY]
          : [],
    },
  },
};

export default config;
