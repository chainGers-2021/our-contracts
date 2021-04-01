require("dotenv").config();

const { test1 } = require("./tasks/1");
const { test2 } = require("./tasks/2");
const { test4 } = require("./tasks/4");

require("@nomiclabs/hardhat-web3");

task("task1", "does positive work for me.").setAction(async () => {
  await test1();
});

task("task2", "does some more positive work for me.").setAction(async () => {
  await test2();
});

task("task4", "runs alchemy forked thing.").setAction(async () => {
  await test4();
});

// Configurations
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    }
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