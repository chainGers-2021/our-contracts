const truffleAssert = require("truffle-assertions");
const Comptroller = artifacts.require("Comptroller");
const Pools = artifacts.require("Pools");
const DonationPools = artifacts.require("DonationPools");
const ERC20 = artifacts.require("IERC20");
const IScaledBalanceToken = artifacts.require("IScaledBalanceToken");

const LINK = {
  Symbol: "LINK",
  TokenAddr: "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
  aTokenAddr: "0xeD9044cA8F7caCe8eACcD40367cF2bee39eD1b04",
  Pricefeed: "0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0",
  Decimals: 8,
};
const BAT = {
  Symbol: "BAT",
  TokenAddr: "0x2d12186Fbb9f9a8C28B3FfdD4c42920f8539D738",
  aTokenAddr: "0x28f92b4c8Bdab37AF6C4422927158560b4bB446e",
  Pricefeed: "0x8e67A0CFfbbF6A346ce87DFe06daE2dc782b3219",
  Decimals: 8,
};
const UNI = {
  Symbol: "UNI",
  TokenAddr: "0x075a36ba8846c6b6f53644fdd3bf17e5151789dc",
  aTokenAddr: "0x601FFc9b7309bdb0132a02a569FBd57d6D1740f2",
  Pricefeed: "0xDA5904BdBfB4EF12a3955aEcA103F51dc87c7C39",
  Decimals: 8,
};
const ZRX = {
  Symbol: "ZRX",
  TokenAddr: "0xd0d76886cf8d952ca26177eb7cfdf83bad08c00c",
  aTokenAddr: "0xf02D7C23948c9178C68f5294748EB778Ab5e5D9c",
  Pricefeed: "0x24D6B177CF20166cd8F55CaaFe1c745B44F6c203",
  Decimals: 8,
};
const SNX = {
  Symbol: "SNX",
  TokenAddr: "0x7fdb81b0b8a010dd4ffc57c3fecbf145ba8bd947",
  aTokenAddr: "0xAA74AdA92dE4AbC0371b75eeA7b1bd790a69C9e1",
  Pricefeed: "0x31f93DA9823d737b7E44bdee0DF389Fe62Fd1AcD",
  Decimals: 8,
};

const toWei = (x) => {
  return (x * 10 ** 18).toString();
};

const fromWei = (x) => {
  return (x / 10 ** 18).toString();
};

const ScaledBalance = async (aTokenAddr, compAddr) => {
  return parseInt(await IScaledBalanceToken.at(aTokenAddr).scaledBalanceOf(compAddr));
}

async function addToken(Token) {
  await comp.addTokenData(
    Token.Symbol,
    Token.TokenAddr,
    Token.aTokenAddr,
    Token.Pricefeed,
    Token.Decimals
  );

  console.log("New token ", Token.Symbol, " added.");
}

async function addRecipient(organisationAddr, organisationName) {
  await don.addRecipient(organisationAddr, organisationName);

  console.log("New recipient ", organisationName, " added.");
}

async function createPool(
  symbol,
  poolName,
  targetPrice,
  typePrivate,
  ownerAddr = admin
) {
  if (!typePrivate) {
    await pools.createPool(symbol, poolName, targetPrice, '0x0000000000000000000000000000000000000000', {
      from: ownerAddr,
    });

    console.log(
      "\nNew public pool name:  ",
      poolName,
      "\nPool symbol: ",
      symbol,
      "\nOwner: ",
      ownerAddr,
      "\nTarget price: ",
      targetPrice
    );
  } else {
    newPoolAccount = await web3.eth.accounts.create();
    await pools.createPool(
      symbol,
      poolName,
      targetPrice,
      newPoolAccount.address,
      { from: ownerAddr }
    );

    for (i = 1; i < 5; ++i) {
      message = await web3.utils.randomHex(32);
      signObject = await web3.eth.accounts.sign(
        message,
        newPoolAccount.privateKey
      );
      await pools.verifyPoolAccess(
        poolName,
        signObject.messageHash,
        signObject.signature,
        { from: accounts[i] }
      );
    }

    console.log(
      "\nNew private pool name: ",
      poolName,
      "\nPrivate key: ",
      newPoolAccount.privateKey,
      "\nPool Symbol: ",
      symbol,
      "\nOwner: ",
      ownerAddr,
      "\nTarget price: ",
      targetPrice
    );
  }
}

async function fundAccountsETH() {
  console.log("\n--Transferring necessary ether amount--\n");
  for (i = 1; i < 5; i++) {
    await web3.eth.sendTransaction({
      to: accounts[i],
      from: admin,
      value: toWei("0.1"),
    });
  }
  console.log("\nSuccessfull!\n");
}
async function fundAccountsERC20(Token, amount) {
  token = await ERC20.at(Token.TokenAddr);

  console.log("\n--Transferring necessary tokens--\n");
  for (i = 1; i < 5; i++) {
    await token.transfer(accounts[i], toWei(amount));
  }
  console.log("\nSuccessfull!\n");
}

async function populatePool(poolName, Token, maxAmount) {
  token = await ERC20.at(Token.TokenAddr);

  console.log("\n--Depositing tokens in a pool--\n");

  for (i = 1; i < 5; i++) {
    await token.approve(comp.address, toWei(maxAmount / i), {
      from: accounts[i],
    });
    await comp.depositERC20(poolName, toWei(maxAmount / i), {
      from: accounts[i],
    });
    console.log(
      Token.Symbol,
      " balance of ",
      i,
      " : ",
      parseInt(await token.balanceOf(accounts[i]))
    );
  }

  console.log("\nSuccessfull!\n");
}

async function dePopulatePool(poolName, Token) {
  token = await ERC20.at(Token.TokenAddr);
  console.log("\n--Withdrawing tokens from a pool--\n");

  for (i = 1; i < 5; i++) {
    await comp.withdrawERC20(poolName, 0, { from: accounts[i] });
    console.log(
      Token.Symbol,
      " balance of ",
      i,
      " : ",
      parseInt(await token.balanceOf(accounts[i]))
    );
  }

  console.log("\nSuccessfull!\n");
}

async function depositByUser(poolName, amount, Token, user) {
  token = await ERC20.at(Token.TokenAddr);

  console.log("\n--Transferring necessary tokens--\n");

  await token.transfer(amount, toWei(10));
  await web3.eth.sendTransaction({
    to: user,
    from: admin,
    value: toWei("0.05"),
  });

  console.log("\nSuccessfull!\n");
  console.log("\n--Depositing tokens in a pool--\n");

  await token.approve(comp.address, amount, { from: user });
  await comp.depositERC20(poolName, amount, { from: user });
  console.log(
    Token.Symbol,
    " balance of ",
    user,
    " : ",
    parseInt(await token.balanceOf(user))
  );

  console.log("\nSuccessfull!\n");
}

async function withdrawByUser(poolName, amount, Token, user) {
  token = await ERC20.at(Token.TokenAddr);
  console.log("\n--Withdrawal by ", user, " initiated--\n");

  await comp.withdrawERC20(poolName, amount, { from: user });
  console.log(
    Token.Symbol,
    " balance of ",
    user,
    " : ",
    parseInt(await token.balanceOf(user))
  );

  console.log("\nSuccessfull\n");
}

describe("--Pools testing--", () => {
  it.only("Simulation should pass", async () => {
    accounts = await web3.eth.getAccounts();
    [admin, user1, user2, user3, _] = accounts;

    comp = await Comptroller.deployed();
    pools = await Pools.deployed();
    don = await DonationPools.deployed();
    link = await ERC20.at(LINK.TokenAddr);

    bat = await ERC20.at(BAT.TokenAddr);
    zrx = await ERC20.at(ZRX.TokenAddr);
    snx = await ERC20.at(SNX.TokenAddr);
    const ScaledBalance = async (aTokenAddr) => {
      iscal = await IScaledBalanceToken.at(aTokenAddr);
      return parseInt(await iscal.scaledBalanceOf(comp.address));
    }
    console.log("Admin ETH balance: ", await web3.eth.getBalance(admin));
    console.log("Admin LINK balance: ", parseInt(await link.balanceOf(admin)));
    console.log("Admin BAT balance: ", parseInt(await bat.balanceOf(admin)));
    console.log("Admin ZRX balance: ", parseInt(await zrx.balanceOf(admin)));
    console.log("Admin SNX balance: ", parseInt(await snx.balanceOf(admin)));

    // Funding the accounts
    await fundAccountsETH();
    await fundAccountsERC20(LINK, 50);
    await fundAccountsERC20(BAT, 100);
    await fundAccountsERC20(ZRX, 100);
    await fundAccountsERC20(SNX, 1);

    // Adding token data to the comptroller contract
    await addToken(LINK);
    await addToken(BAT);
    await addToken(ZRX);
    await addToken(SNX);

    // Adding recipients to the Donation pool contract
    await addRecipient(admin, "DEV");

    // Creating a few public pools
    await createPool(LINK.Symbol, "LPUBLIC", 50, false);
    await createPool(BAT.Symbol, "BPUBLIC", 2, false);
    await createPool(SNX.Symbol, "SPUBLIC", 25, false);

    //Creating a few private pools
    await createPool(LINK.Symbol, "LPRIVATE", 50, true, user1);
    await createPool(ZRX.Symbol, "ZPRIVATE", 3, true, user3);

    console.log("\nPopulating public pools\n");

    await populatePool("LPUBLIC", LINK, 10, false);
    console.log("Pool scaled balance: ", await ScaledBalance(LINK.aTokenAddr));
    await populatePool("BPUBLIC", BAT, 100, false);
    console.log("Pool scaled balance: ", await ScaledBalance(BAT.aTokenAddr));
    await populatePool("SPUBLIC", SNX, 1, false);
    console.log("Pool scaled balance: ", await ScaledBalance(SNX.aTokenAddr));

    console.log("\nPopulating private pools\n");

    await populatePool("LPRIVATE", LINK, 10, true);
    console.log("Pool scaled balance: ", await ScaledBalance(LINK.aTokenAddr));
    await populatePool("ZPRIVATE", ZRX, 100, true);
    console.log("Pool scaled balance: ", await ScaledBalance(ZRX.aTokenAddr));

    console.log("\nDe-populating private pools except LINK pool\n");
    // await dePopulatePool("LPRIVATE", LINK, true);
    // console.log("Pool scaled balance: ", await ScaledBalance(LINK.aTokenAddr));
    await dePopulatePool("ZPRIVATE", ZRX, true);
    console.log("Pool scaled balance: ", await ScaledBalance(ZRX.aTokenAddr));

    console.log("\nDe-populating public pools\n");
    await dePopulatePool("LPUBLIC", LINK, false);
    console.log("Pool scaled balance: ", await ScaledBalance(LINK.aTokenAddr));
    await dePopulatePool("BPUBLIC", BAT, false);
    console.log("Pool scaled balance: ", await ScaledBalance(BAT.aTokenAddr));
    await dePopulatePool("SPUBLIC", SNX, false);
    console.log("Pool scaled balance: ", await ScaledBalance(SNX.aTokenAddr));
  });

  // callback("Completed");
});


// // The following tests won't work for the new contracts
// const truffleAssert = require("truffle-assertions");
// const assert = require("assert");
// const Comptroller = artifacts.require("Comptroller");
// const Pools = artifacts.require("Pools");
// const DonationPools = artifacts.require("DonationPools");
// const ERC20 = artifacts.require("IERC20");
// const IScaledBalanceToken = artifacts.require("IScaledBalanceToken");
// const ScaledMath = artifacts.require("ScaledMath");

// const linkAddress = "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789";
// const aLinkAddress = "0xeD9044cA8F7caCe8eACcD40367cF2bee39eD1b04";

// const toWei = (x) => {
//   return (x * 10 ** 18).toString();
// };

// const fromWei = (x) => {
//   return (x / 10 ** 18).toString();
// };

// let comp, pools, don;
// contract("--Pools testing--", async (accounts) => {
//   const [admin, user1, user2, _] = accounts;

//   before("Deploying contracts", async () => {
//     link = await ERC20.at(linkAddress);
//     console.log("Admin ETH balance: ", await web3.eth.getBalance(admin));
//     console.log("Admin LINK balance: ", parseInt(await link.balanceOf(admin)));

//     await deployer.deploy(ScaledMath);
//     await deployer.link(ScaledMath, Comptroller);
//     await deployer.link(ScaledMath, Pools);

//     comp = await Comptroller.new();
//     pools = await Pools.new(comp.address);
//     don = await DonationPools.new(comp.address);

//     await comp.setPoolAddresses(
//       pools.address,
//       don.address
//     );

//     const addTokenData = await comp.addTokenData(
//       "LINK",
//       "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
//       "0xeD9044cA8F7caCe8eACcD40367cF2bee39eD1b04",
//       "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
//       8
//     );

//     // Adding a recipient of the donation amounts
//     const addRecipient = await don.addRecipient(admin, "DEV");

//     // Creating public pool
//     await pools.createPool("LINK", "Test1", 45, '0x0000000000000000000000000000000000000000', {
//       from: admin,
//     });
//     console.log("Test1 created");

//     for (i = 1; i < 5; i++) {
//       const transferLink = await link.transfer(accounts[i], toWei(10));
//       const sendtx = await web3.eth.sendTransaction({
//         to: accounts[i],
//         from: admin,
//         value: toWei("0.5"),
//       });
//     }

//     //Initial balances
//     console.log("Initial balances: ");
//     for (i = 1; i < 5; i++) {
//       console.log(
//         "LINK balance of ",
//         i,
//         " : ",
//         parseInt(await link.balanceOf(accounts[i]))
//       );
//     }
//   });

//   it("Allows users to deposit LINK", async () => {
//     // depositing into a pool
//     console.log("Balances after Deposit: ");
//     for (i = 1; i < 5; i++) {
//       await link.approve(comp.address, toWei(1), {
//         from: accounts[i],
//       });
//       await comp.depositERC20("Test1", toWei(1), false, {
//         from: accounts[i],
//       });
//       console.log(
//         "LINK balance of ",
//         i,
//         " : ",
//         parseInt(await link.balanceOf(accounts[i]))
//       );
//     }
//   });

//   it("allows users to withdraw their stake(LINK)", async () => {
//     // state change
//     // console.log(await pub.breakPool("Test1", {from: admin}));
//     console.log("Balances after withdrawal: ");
//     for (i = 1; i < 5; ++i) {
//       await comp.withdrawERC20("Test1", toWei(0.5), false, {
//         from: accounts[i],
//       });
//       console.log(
//         "LINK balance of ",
//         i,
//         " : ",
//         parseInt(await link.balanceOf(accounts[i]))
//       );
//     }
//     console.log(
//       "LINK balance of admin: ",
//       parseInt(await link.balanceOf(admin))
//     );

//     const iscal = await IScaledBalanceToken.at(aLinkAddress);
//     console.log(
//       "Pool scaled balance: ",
//       parseInt(await iscal.scaledBalanceOf(comp.address))
//     );
//   });

//   // it("Allows recipients of donation pools to withdraw their stake", async () => {
//   //   await comp.withdrawDonation("LINK");
//   //   console.log("Donation withdrawal successfull");
//   //   console.log("LINK balance of admin: ", parseInt(await link.balanceOf(admin)));
//   //   console.log("Pool scaled balance: ", parseInt(await iscal.scaledBalanceOf(comp.address)));
//   // });

//   console.log("--End of Pools Testing--");
// });
