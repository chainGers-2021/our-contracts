const kovan = require("./../info/kovan.json");
const tokenAddr = kovan[6].address;
const aTokenAddr = kovan[6].aTokenAddress;
const Token = require("@aave/protocol-v2/artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json");
const tokenABI = Token.abi;
const inWei = 10 ** 18;
const pool = "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe";
const compiledILendingPool = require("@aave/protocol-v2/artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json");
const compiledIScaledBalanceToken = require("@aave/protocol-v2/artifacts/contracts/interfaces/IScaledBalanceToken.sol/IScaledBalanceToken.json");

async function test2() {
  const myAccount = (await web3.eth.getAccounts())[0];
  const myAccount2 = (await web3.eth.getAccounts())[1];
  console.log("Account address: ", myAccount);
  console.log("Ether balance: ", await web3.eth.getBalance(myAccount));

  allowLimit = BigInt(1000 * inWei);
  sendAmount1 = BigInt(0.001 * inWei);
  sendAmount2 = BigInt(0.002 * inWei);
  aTokenAllowLimit = BigInt(0.003 * inWei);
  uintMax = BigInt(2 ** 256 - 1);

  /** Contract instances */
  token = new web3.eth.Contract(tokenABI, tokenAddr);
  aToken = new web3.eth.Contract(tokenABI, aTokenAddr);
  lendingPool = new web3.eth.Contract(compiledILendingPool.abi, pool);
  _aToken = new web3.eth.Contract(compiledIScaledBalanceToken.abi, aTokenAddr);

  // /** Approval methods */
  // Approving pool to spend ERC20
  // await token.methods
  //   .approve(pool, allowLimit)
  //   .send({ from: myAccount })
  //   .then(console.log);

  // //   // Approving pool to spend aToken
  //   await aToken.methods
  //     .approve(pool, allowLimit)
  //     .send({ from: myAccount })
  //     .then(console.log);

  // process.exit(0);



  // Liquidity index using getReserveData()
  // ret = await lendingPool.methods.getReserveData(tokenAddr).call();
  // liquidityIndex = (ret.liquidityIndex / 10 ** 27).toString();
  // console.log("liquidityIndex now: " + liquidityIndex);

  // Checking ERC20 balance
  await aToken.methods
    .balanceOf(myAccount)
    .call()
    .then((res) => {
      console.log("ERC20 balance: ", res);
      currentBalance = res;
    });

  // Approving pool to spend ERC20
  await token.methods
    .approve(pool, allowLimit)
    .send({ from: myAccount })
    .then((tx) => console.log("Approve1: ", tx.gasUsed));

  // Sending ERC20 to aave lending pool
  await lendingPool.methods
    .deposit(tokenAddr, sendAmount1, myAccount2, 0)
    .send({ from: myAccount })
    .then((tx) => console.log("Deposit1() gas used: ", tx.gasUsed));

  // Scaled balance
  await _aToken.methods.scaledBalanceOf(myAccount)
    .call()
    .then(a => { console.log("Scaled balance1: ", a); scaledBalance = a; });

  // Liquidity index using getReserveData
  ret = await lendingPool.methods.getReserveData(tokenAddr).call();
  liquidityIndex = (ret.liquidityIndex / 10 ** 27).toString();
  console.log("liquidityIndex now: " + liquidityIndex);


  val1 = scaledBalance * liquidityIndex;
  val2 = currentBalance;
  console.log("scaledBalance*liquidityIndex: ", val1);
  console.log("Current balance: ", val2);

  process.exit(0);

  // Approving pool to spend ERC20
  await token.methods
    .approve(pool, allowLimit)
    .send({ from: myAccount })
    .then((tx) => console.log("Approve2 ", tx.gasUsed));


  // Sending ERC20 to aave lending pool
  await lendingPool.methods
    .deposit(tokenAddr, sendAmount2, myAccount, 0)
    .send({ from: myAccount })
    .then((tx) => console.log("Deposit2() gas used: ", tx.gasUsed));


  // Liquidity index using getReserveData
  ret = await lendingPool.methods.getReserveData(tokenAddr).call();
  liquidityIndex = (ret.liquidityIndex / 10 ** 27).toString();
  console.log("liquidityIndex now: " + liquidityIndex);

  await token.methods
    .balanceOf(myAccount)
    .call()
    .then((res) => {
      console.log("ERC20 balance: ", res);
      currentBalance = res;
    });

  // Scaled balance
  await _aToken.methods.scaledBalanceOf(myAccount)
    .call()
    .then(a => { console.log("Scaled balance2: ", a); scaledBalance = a; });

  val1 = scaledBalance * liquidityIndex;
  val2 = currentBalance;
  console.log("scaledBalance*liquidityIndex: ", val1);
  console.log("Current balance: ", val2);

  //   // Approving pool to spend aToken
  await aToken.methods
    .approve(pool, allowLimit)
    .send({ from: myAccount, gas: 10 ** 7 })
    .then((tx) => console.log("aToken approve() gas used: ", tx.gasUsed));

  // Asking pool to withdraw
  await lendingPool.methods
    .withdraw(tokenAddr, aTokenAllowLimit, myAccount)
    .send({ from: myAccount, gas: 10 ** 7 })
    .then((tx) => console.log("Withdraw() gas used: ", tx.gasUsed));

  // Scaled balance
  await _aToken.methods.scaledBalanceOf(myAccount)
    .call()
    .then(a => { console.log("Scaled balance3: ", a); scaledBalance = a; });

  // Checking ERC20 balance
  await token.methods
    .balanceOf(myAccount)
    .call()
    .then((res) => {
      currentBalance = res;
    });

  // Liquidity index using getReserveData
  ret = await lendingPool.methods.getReserveData(tokenAddr).call();
  liquidityIndex = (ret.liquidityIndex / 10 ** 27).toString();
  console.log("liquidityIndex now: " + liquidityIndex);

  val1 = scaledBalance * liquidityIndex;
  val2 = currentBalance;
  console.log("scaledBalance*liquidityIndex: ", val1);
  console.log("Current balance: ", val2);
}
module.exports = { test2 };
