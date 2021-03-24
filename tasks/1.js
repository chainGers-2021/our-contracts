const kovan = require("./../info/kovan.json");
const tokenAddr = kovan[6].address;
const aTokenAddr = kovan[6].aTokenAddress;
const Token = require("@aave/protocol-v2/artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json");
const tokenABI = Token.abi;
const inWei = 10 ** 18;
const pool = "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe";
const compiledILendingPool = require("@aave/protocol-v2/artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json");
const compiledIScaledBalanceToken = require("@aave/protocol-v2/artifacts/contracts/interfaces/IScaledBalanceToken.sol/IScaledBalanceToken.json");

async function test1() {
  const myAccount = (await web3.eth.getAccounts())[0];
  console.log("Account address: ", myAccount);
  console.log("Ether balance: ", await web3.eth.getBalance(myAccount));

  allowLimit = (0.001 * inWei).toString();
  const token = new web3.eth.Contract(tokenABI, tokenAddr);

  // Checking ERC20 balance
  await token.methods
    .balanceOf(myAccount)
    .call()
    .then((res) => {
      console.log("ERC20 balance: ", res);
    });

  // Approving pool to spend ERC20
  await token.methods
    .approve(pool, allowLimit)
    .send({ from: myAccount })
    .then(console.log);

  lendingPool = new web3.eth.Contract(compiledILendingPool.abi, pool);

  // Sending ERC20 to aave lending pool
  await lendingPool.methods
    .deposit(tokenAddr, allowLimit, myAccount, 0)
    .send({ from: myAccount })
    .then(console.log);

  inf = (10 ** 20).toString();
  aToken = new web3.eth.Contract(tokenABI, aTokenAddr);

  // Approving aToken
  await aToken.methods
    .approve(pool, inf)
    .send({ from: myAccount })
    .then(console.log);

  // Asking pool to with draw
  await lendingPool.methods
    .withdraw(tokenAddr, allowLimit, myAccount)
    .send({ from: myAccount })
    .then(console.log);
}
module.exports = { test1 };
