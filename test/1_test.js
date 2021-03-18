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
  // console.log(privatePoolDeployedAddress);

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
  // console.log(factory.options.address);

  // Comptroller deploy
});

describe("Deposit", async function () {
  it("Verifies a user's invitation", async function () {

    // Create a new account. It returns an account address and its corresponding privateKey.
    newAccountData = await web3.eth.accounts.create();

    // Compile and deploy the verification contract (a test contract) by passing the account address as an argument.
    compiledVerification = await hre.artifacts.readArtifact("Verification");
    verificationContract = await new web3.eth.Contract((await compiledVerification).abi)
    .deploy({ 
      data: (await compiledVerification).bytecode,
      arguments: [newAccountData.address]
    })
    .send({ from: admin })
    console.log("Verification contract address: ", verificationContract.options.address);
    
    // Generate a random string. This string is signed using the privateKey.
    randomHexString = await web3.utils.randomHex(32);
    signObject = await web3.eth.accounts.sign(randomHexString, newAccountData.privateKey);
    // console.log("Sign object is: ", signObject);

    // Send the hashMessage of the signObject along with the r, s and v values of the signObject.
    await verificationContract.methods.verify(signObject.messageHash, signObject.v, signObject.r, signObject.s)
      .call()
      .then((reply) => {
        // If successfully verifies should print 'true'.
        console.log("Verification function returns: ", reply);
      });

  });
});
