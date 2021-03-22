const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const seedPhrase = '';
const rpcEndpoint = 'https://kovan.infura.io/v3/19b85f951b5a4440923fa8f61eb27245';
let provider = new HDWalletProvider({mnemonic: {phrase: seedPhrase},providerOrUrl: rpcEndpoint});
const web3 = new Web3(provider);

const inWei = 10**18;

const LendingPoolAddressesProviderABI = require("../info/LendingPoolAddressesProvider.json");
const compiledLendingPool = require("../info/LendingPool.json");

const lpAddressProviderAddress = '0x88757f2f99175387ab4c6a4b3067c77a695b0349';
const lpAddressProviderContract = new web3.eth.Contract(LendingPoolAddressesProviderABI, lpAddressProviderAddress);
const ATokenABI = require("../info/AToken.json")
const kovan = require("../info/kovan.json");


const deploy = async () => {
  [myaccount, _] = await web3.eth.getAccounts();
  console.log('Account: ', myaccount);
  
  // Get the latest LendingPool contract address
  const lpAddress = await lpAddressProviderContract.methods
  .getLendingPool().call()
  .catch((e) => {
    throw Error(`Error getting lendingPool address: ${e.message}`)
  })
  console.log("lpAddress found: ", lpAddress);
  const lpContract = new web3.eth.Contract(compiledLendingPool.abi, lpAddress);
  
  // Make the deposit transaction via LendingPool contract
  tokenAddress = kovan[6].address;
  const tokenContract = new web3.eth.Contract(ATokenABI, tokenAddress)
  
  
  await tokenContract.methods.balanceOf(myaccount).call()
  .then(data=>console.log("My balance: ", data));
  
  // transfer(account, amount)
  // tokenAmount = (200*inWei).toString();
  // await tokenContract.methods.transfer(lpAddress, tokenAmount)
  // .send({from: accounts[0]})
  // .then(data=>console.log(data));
  
  // allowance(owner, otherperson)
  // await tokenContract.methods.allowance(myaccount, myaccount)
  // .send({from: myaccount})
  // .then(data=>{
  //   console.log("blockHash: ", data.blockHash);
  //   console.log("gasUsed: ", data.gasUsed);
  // });
  
  // withdraw
  // tokenAmount = (500*inWei).toString();
  // await lpContract.methods.withdraw(tokenAddress, tokenAmount, myaccount)
  // .send({from: myaccount})
  // .then(data=>console.log(data));

  return process.exit(0);
};

deploy();