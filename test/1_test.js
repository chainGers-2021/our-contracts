// const { expect } = require("chai");
const assert = require("assert");
const Web3 = require("web3");
const hre = require("hardhat");
const truffleAssert = require("truffle-assertions");
const web3 = new Web3(hre.network.provider);

let privatePoolDeployedAddress;
let linkTokenAddress;
let aLinkTokenAddress;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  admin = accounts[0];
  user1 = accounts[1];
  user2 = accounts[2];
  user3 = accounts[3];

  linkTokenAddress = web3.eth.accounts.create().address; // Change this.
  aLinkTokenAddress = web3.eth.accounts.create().address; // Change this.
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

  await factory.methods.addTokenAddress(linkTokenAddress, aLinkTokenAddress)
    .send({ from: admin });
  // console.log(factory.options.address);

  // Comptroller deploy
});

describe("Verification Process", async function () {
  it("Verifies a user's invitation in verification contract", async function () {

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
      .send({ from: admin });

    // This should return true as admin has been verfied.
    await verificationContract.methods.verified(admin)
    .call()
    .then((reply) => {
      console.log("Admin verified: ", reply);
    });

    // Checks if unauthorized access takes place and reverts.
    await truffleAssert.reverts(
      verificationContract.methods.verify(signObject.messageHash, signObject.v, signObject.r, signObject.s)
      .send({ from: user1 }),
      "Unauthorized access: Reusing signature"
    ); 

    // This should return false as user1 tried to get unauthorized access.
    await verificationContract.methods.verified(user1)
    .call()
    .then((reply) => {
      console.log("User1 verified: ", reply);
    });
  });

  it.only("Verifies user in a private pool", async () =>{
    // Create a new account. It returns an account address and its corresponding privateKey.
    newAccountData = await web3.eth.accounts.create();
    
    // Create a new pool.
    await factory.methods.createPool(linkTokenAddress, "TEST", 1000000000, newAccountData.address)
      .send({ from: user1 });
    privatePool = await factory.methods.poolNames("TEST").call();
    console.log("New private pool address: ", privatePool);
    
    // Generate a random string. This string is signed using the privateKey.
    randomHexString = await web3.utils.randomHex(32);
    signObject = await web3.eth.accounts.sign(randomHexString, newAccountData.privateKey);

    // Send the hashMessage of the signObject along with the r, s and v values of the signObject to the private pool via factory contract.
    await factory.methods.factoryVerify("TEST", signObject.messageHash, signObject.v, signObject.r, signObject.s)
      .send({ from: user2 });

    await factory.methods.getVerifiedStatus("TEST")
      .call({ from: user2 })
      .then((result) => {
        console.log("User2 is verified: ", result);
      });

    await factory.methods.getVerifiedStatus("TEST")
      .call({from: user3})
      .then((result) => {
        console.log("User3 is verified: ", result);
      });
  });

});
