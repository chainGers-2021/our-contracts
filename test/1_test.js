// const { expect } = require("chai");
const assert = require("assert");
const Web3 = require("web3");
const hre = require("hardhat");
const web3 = new Web3(hre.network.provider);

let privatePoolDeployedAddress;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  admin = accounts[0];
  user1 = accounts[1];
  user2 = accounts[2];

  // Deploying PrivatePool
  compiledPrivatePool = await hre.artifacts.readArtifact("PrivatePool");
  await new web3.eth.Contract((await compiledPrivatePool).abi)
    .deploy({ data: (await compiledPrivatePool).bytecode })
    .send({ from: admin })
    .then((con) => {
      privatePoolDeployedAddress = con.options.address;
    });
  console.log(privatePoolDeployedAddress);

  // Deploying Factory
  compiledFactory = await hre.artifacts.readArtifact("Factory");
  factory = await new web3.eth.Contract((await compiledFactory).abi)
    .deploy({
      data: (await compiledFactory).bytecode,
      arguments: [privatePoolDeployedAddress],
    })
    .send({
      from: admin,
    });
  console.log(factory.options.address);

  // Comptroller deploy
});

describe("Deposit", async function () {
  it("Allows user to deposit", async function () {
    


  });
});
