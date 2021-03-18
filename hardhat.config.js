module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    kovan: {
      url: "https://kovan.infura.io/v3/19b85f951b5a4440923fa8f61eb27245",
      accounts: ["10aa5daadb05af6110e6446518b2c90e514b6b19fd11b8107d731ca6d3e8c7bb"]
    }
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 60000
  }
}