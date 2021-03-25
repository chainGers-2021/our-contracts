// const { expect } = require("chai");
// const assert = require("assert");
const Web3 = require("web3");
const hre = require("hardhat");
const truffleAssert = require("truffle-assertions");
const web3 = new Web3(hre.network.provider);
const kovan = require("./../info/kovan.json");
const linkTokenAddress = kovan[6].address;
const tokenAddr = kovan[6].address;
const aLinkTokenAddress = kovan[6].aTokenAddress;
const Token = require("@aave/protocol-v2/artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json");
const tokenABI = Token.abi;
const inWei = 10 ** 18;
const lendingPoolAddressProvider = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
const pool = "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe";
const compiledILendingPool = require("@aave/protocol-v2/artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json");
const compiledIScaledBalanceToken = require("@aave/protocol-v2/artifacts/contracts/interfaces/IScaledBalanceToken.sol/IScaledBalanceToken.json");

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    admin = accounts[0];
    user = accounts[1];
    console.log("Ether balance of admin: ", await web3.eth.getBalance(admin));
    console.log("Ether balance of user: ", await web3.eth.getBalance(user));

    tokenAllowLimit = BigInt(100 * inWei);
    sendAmount1 = BigInt(0.001 * inWei);
    sendAmount2 = BigInt(0.002 * inWei);
    aTokenAllowLimit = BigInt(0.003 * inWei);
    uintMax = BigInt(2 ** 256 - 1);

    // await aLinkTokenAddress.methods
    // .balanceOf(admin)
    // .call()
    // .then((res) => {
    //   console.log("Admin ERC20 balance: ", res);
    //   currentBalance = res;
    // });


    // Deploying Factory
    compiledFactoryV2 = await hre.artifacts.readArtifact("PoolFactory");
    factoryV2 = await new web3.eth.Contract((await compiledFactoryV2).abi)
        .deploy({
            data: (await compiledFactoryV2).bytecode,
            // arguments: [lendingPoolAddressProvider],
        })
        .send({
            from: admin,
        })
    
    console.log("Deploy at:", factoryV2.options.address);

    await factoryV2.methods.addTokenAddress(linkTokenAddress, aLinkTokenAddress)
        .send({ from: admin });


    newAccountData = await web3.eth.accounts.create();

    // Create a new pool.
    await factoryV2.methods.createPool(linkTokenAddress, "TEST", 50, newAccountData.address)
        .send({ from: admin });

    console.log("Pool exists: ", await factoryV2.methods.verifyPool("TEST").call());

    // Generate a random string. This string is signed using the privateKey.
    randomHexString = await web3.utils.randomHex(32);
    signObject = await web3.eth.accounts.sign(randomHexString, newAccountData.privateKey);

    // Send the hashMessage of the signObject along with the r, s and v values of the signObject to the private pool via factory contract.
    await factoryV2.methods.verifyPoolAccess("TEST", signObject.messageHash, signObject.signature)
        .send({ from: user });

    await factoryV2.methods.getVerifiedStatus("TEST")
        .call({ from: user })
        .then((result) => {
            console.log("User is verified: ", result);
        });

});

describe("Deposit process", async function () {
    it("Should be able to create pools", async () => {
        // Create a new account. It returns an account address and its corresponding privateKey.
        newAccountData = await web3.eth.accounts.create();

        // Create a new pool.
        await factoryV2.methods.createPool(linkTokenAddress, "TEST", 50, newAccountData.address)
            .send({ from: admin });
        console.log("Pool exists: ", await factoryV2.methods.verifyPool("TEST").call());

        // Generate a random string. This string is signed using the privateKey.
        randomHexString = await web3.utils.randomHex(32);
        signObject = await web3.eth.accounts.sign(randomHexString, newAccountData.privateKey);

        // Send the hashMessage of the signObject along with the r, s and v values of the signObject to the private pool via factory contract.
        await factoryV2.methods.verifyPoolAccess("TEST", signObject.messageHash, signObject.signature)
            .send({ from: user });

        await factoryV2.methods.getVerifiedStatus("TEST")
            .call({ from: user })
            .then((result) => {
                console.log("User is verified: ", result);
            });
    });

    it.only("Should allow users to deposit", async () => {
        token = new web3.eth.Contract(tokenABI, tokenAddr);
        
        // Approving pool to spend ERC20
        await token.methods
        .approve(factoryV2.options.address, sendAmount1)
        .send({ from: user })
        .then((tx) => console.log("Approve1: ", tx.gasUsed));
        
        await factoryV2.methods.depositERC20("TEST", sendAmount1)
        .send({ from: user, gas: 10**7 })
        .then((tx) => console.log("depositERC20(): ", tx.gasUsed));

        _aToken = new web3.eth.Contract(compiledIScaledBalanceToken.abi, aLinkTokenAddress);
        // Scaled balance
        await _aToken.methods.scaledBalanceOf(factoryV2.options.address)
        .call()
        .then(a => { console.log("Scaled balance: ", a);});



        await factoryV2.methods.getUserDeposit("TEST").call({ from: user })
        .then(tx=>console.log("Deposit amount: ", tx));

        await factoryV2.methods.priceFeedData("0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0").call()
        .then(tx=>console.log("Price feed: ", tx));
    });

});
