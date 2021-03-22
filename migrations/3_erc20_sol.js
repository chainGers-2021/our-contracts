var fs = require('fs-extra');
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
let web3;

const compiledContract = require("./../build/contracts/Comptroller.json");
let deployedAddress;

const Token = require("@aave/protocol-v2/artifacts/contracts/protocol/tokenization/AToken.sol/AToken.json")
const tokenABI = Token.abi;

const kovan = require("./../info/kovan.json");
const tokenAddr = kovan[6].address;
const aTokenAddr = kovan[6].aTokenAddress;

const inWei = 10**18;

const compiledLendingPool = require("@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json");
const compiledIScaledBalanceToken = require("@aave/protocol-v2/artifacts/contracts/interfaces/IScaledBalanceToken.sol/IScaledBalanceToken.json");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function deploy(){   
    myaccount = (await web3.eth.getAccounts())[0];
    console.log(myaccount);
    console.log(await web3.eth.getBalance(myaccount));
    
    // Deploying contract
    await new web3.eth.Contract(compiledContract.abi)
    .deploy({ data: compiledContract.bytecode })
    .send({ from: myaccount})
    .then(con=>{deployedAddress = con.options.address});

    // Allow ERC20
    allowLimit = (1*inWei).toString();
    const token = new web3.eth.Contract(tokenABI, tokenAddr);
    await token.methods.approve(deployedAddress, allowLimit)
    .send({from: myaccount})
    .then(tx=>console.log(tx.gasUsed));


    // Deposit
    trader = new web3.eth.Contract(compiledContract.abi, deployedAddress);
    pool = '0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe';
    await trader.methods.deposit(allowLimit, tokenAddr, pool)
    .send({from: myaccount})
    .then(tx=>console.log(tx.gasUsed));
    
    
    
    // checking balance
    aToken = new web3.eth.Contract(tokenABI, aTokenAddr);
    currentBalance = await aToken.methods.balanceOf(deployedAddress).call();
    console.log("currentBalance: "+currentBalance);
    
    // // getting scaled balance
    _lendingPool = new web3.eth.Contract(compiledIScaledBalanceToken.abi, aTokenAddr);
    scaledBalance = await _lendingPool.methods.scaledBalanceOf(deployedAddress).call();
    console.log("scaledBalance: "+scaledBalance);
    
    
    // // getting liquidity index
    lendingPool = new web3.eth.Contract(compiledLendingPool.abi, pool);
    ret = await lendingPool.methods.getReserveData(tokenAddr).call();
    liquidityIndex = (ret.liquidityIndex/10**27).toString();
    console.log("liquidityIndex: "+liquidityIndex);


    // // check: scaledBalance*lin
    val1 = scaledBalance*liquidityIndex
    val2 = currentBalance
    console.log(val1)
    console.log(val2)



    
    

    // .then(data=>console.log(data));
    
    // await trader.methods.withdraw(allowLimit, tokenAddr, pool, aTokenAddr)
    // .send({from: myaccount, gas: (10**6).toString()})
    // .then(tx=>console.log(tx.gasUsed));

    // res = await trader.methods.myfun(aTokenAddr).call();
    // console.log(await aToken.methods.balanceOf(deployedAddress).call());
    // await sleep(1000);

    
    return process.exit(0);
}

async function readSecret(){
    await fs.readFile('secret.txt', 'utf8', function(err, data) {
        if (err) throw err;
        const rpcEndpoint = 'https://kovan.infura.io/v3/19b85f951b5a4440923fa8f61eb27245';
        // const rpcEndpoint = 'https://rpc.testnet.moonbeam.network';
        provider = new HDWalletProvider({mnemonic: {phrase: data},providerOrUrl: rpcEndpoint});
        web3 = new Web3(provider);
        deploy().catch(e=>{
            console.log(e);
        });
    })
}

readSecret()