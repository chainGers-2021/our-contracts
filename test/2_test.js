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
    sendAmount1 = BigInt(1 * inWei);
    sendAmount2 = BigInt(0.001 * inWei);
    aTokenAllowLimit = BigInt(1 * inWei);
    uintMax = BigInt(2 ** 256 - 1);

    aLinkTokenAddressContract = new web3.eth.Contract(tokenABI, aLinkTokenAddress);

    await aLinkTokenAddressContract.methods
    .balanceOf(admin)
    .call()
    .then((res) => {
      console.log("Admin ERC20 balance: ", res);
      currentBalance = res;
    });

    // process.exit(0);

    // Deploying Factory
    compiledFactoryV2 = await hre.artifacts.readArtifact("PrivatePools");
    factoryV2 = await new web3.eth.Contract((await compiledFactoryV2).abi)
        .deploy({
            data: (await compiledFactoryV2).bytecode,
        })
        .send({
            from: admin,
        })
    
    console.log("Deployed at:", factoryV2.options.address);
    // console.log("Admin address is owner address: ", admin === await factoryV2.methods.checkOwner().call());
    // console.log("User address is owner address: ", user === await factoryV2.methods.checkOwner().call());

    await factoryV2.methods.addTokenData("LINK", linkTokenAddress, aLinkTokenAddress, "0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0", 8)
        .send({ from: admin })
        .then(tx=>console.log(tx));
    // Creating a account address and corresponding private key for a new pool
    newAccountData = await web3.eth.accounts.create();
    // console.log("Pool exists: ", await factoryV2.methods.verifyPool("TEST").call());
    // await factoryV2.methods.isPoolEmpty("TEST").call()
    // .then(tx=>console.log("Pool name: ", tx));
    // Create a new pool.
    await factoryV2.methods.createPool("LINK", "TEST", 1000, newAccountData.address)
        .send({ from: admin, gas: 10**7 })

    console.log("Pool exists: ", await factoryV2.methods.verifyPool("TEST").call());
    
    // await factoryV2.methods.isPoolEmpty("TEST").call()
    //     .then(tx=>console.log("Pool name: ", tx));

    // process.exit(0);
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
        
        await aLinkTokenAddressContract.methods
        .balanceOf(user)
        .call()
        .then((res) => {
            console.log("User ERC20 balance before deposit: ", res);
        });

        await factoryV2.methods.depositERC20("TEST", sendAmount1)
        .send({ from: user, gas: 10**7 })
        .then((tx) => console.log("depositERC20(): ", tx.gasUsed));
        
        await aLinkTokenAddressContract.methods
        .balanceOf(user)
        .call()
        .then((res) => {
            console.log("User ERC20 balance after deposit: ", res);

        });

        _aToken = new web3.eth.Contract(compiledIScaledBalanceToken.abi, aLinkTokenAddress);

        // Scaled balance
        await _aToken.methods.scaledBalanceOf(factoryV2.options.address)
        .call()
        .then(a => { console.log("Scaled balance: ", a);});

        let userScaled;
        await factoryV2.methods.getUserScaledDeposit("TEST").call({ from: user })
        .then((tx)=>{
            console.log("Scaled Balance from contract: ", tx);
            userScaled = tx;
        }); 
        
        await factoryV2.methods.getUserScaledBalance("TEST").call({ from: user })
        .then((tx)=>{ 
            console.log("aToken amount from contract: ", tx);
        });
        
        await factoryV2.methods.getReserveData("TEST").call()
        .then((tx)=>{
            console.log("Liquidity index before withdrawal: ", tx[0]);
            console.log("Reserve normalized income: ", tx[1]);
            console.log("aToken amount to be withdrawn (LI): ", (tx[0]*userScaled)/10**27);
            console.log("aToken amount to be withdrawn (RNI): ", (tx[1]*userScaled)/10**27);
        });

        
        // await factoryV2.methods.getReserveNormalizedIncome("TEST").call()
        // .then(tx=> console.log("Reserve normalized income: ", tx));

        await factoryV2.methods.withdrawERC20("TEST", 0)
        .send({ from: user, gas: 10**7 });

        await _aToken.methods.scaledBalanceOf(factoryV2.options.address)
        .call()
        .then(a => { console.log("Scaled balance after withdrawal: ", a);});

        await factoryV2.methods.getUserScaledDeposit("TEST").call({ from: user })
        .then(tx=>console.log("User scaled balance after withdrawal: ", tx));

        await factoryV2.methods.getPoolScaledAmount("TEST").call()
        .then(tx=>console.log("Pool scaled amount: ", tx));

        await aLinkTokenAddressContract.methods
        .balanceOf(user)
        .call()
        .then((res) => {
            console.log("User ERC20 balance after withdraw: ", res);
            currentBalance = res;
        });

        await aLinkTokenAddressContract.methods
        .balanceOf(factoryV2.options.address)
        .call()
        .then((res) => {
            console.log("Contract ERC20 balance after withdraw: ", res);
            currentBalance = res;
        });

    });

});
