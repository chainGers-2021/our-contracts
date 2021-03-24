const { test1 } = require("./tasks/1");
const { test2 } = require("./tasks/2");
require("@nomiclabs/hardhat-web3");

task("task1", "does positive work for me.").setAction(async () => {
  await test1();
});

task("task2", "does some more positive work for me.").setAction(async () => {
  await test2();
});

// Configurations
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    kovan: {
      url: "https://kovan.infura.io/v3/19b85f951b5a4440923fa8f61eb27245",
      accounts: [
        "10aa5daadb05af6110e6446518b2c90e514b6b19fd11b8107d731ca6d3e8c7bb",
        "d736eccc140e5923b2bbeff47f49dd82557f0a0b8680a2ed74bd2e6ba626ebf1"
      ],
    },
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 600000,
  },
};
