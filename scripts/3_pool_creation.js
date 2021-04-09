const Comptroller = artifacts.require("Comptroller");
const PrivatePools = artifacts.require("PrivatePools");
const PublicPools = artifacts.require("PublicPools");
const DonationPools = artifacts.require("DonationPools");
const ERC20 = artifacts.require("IERC20");
const IScaledBalanceToken = artifacts.require("IScaledBalanceToken");

const LINK = {
  Symbol: "LINK",
  TokenAddr: "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
  aTokenAddr: "0xeD9044cA8F7caCe8eACcD40367cF2bee39eD1b04",
  Pricefeed: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
  Decimals: 8,
};
const UNI = {
  Symbol: "UNI",
  TokenAddr: "0x075a36ba8846c6b6f53644fdd3bf17e5151789dc",
  aTokenAddr: "0x601FFc9b7309bdb0132a02a569FBd57d6D1740f2",
  Pricefeed: "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
  Decimals: 8,
};
const YFI = {
  Symbol: "YFI",
  TokenAddr: "0xb7c325266ec274feb1354021d27fa3e3379d840d",
  aTokenAddr: "0xF6c7282943Beac96f6C70252EF35501a6c1148Fe",
  Pricefeed: "0xA027702dbb89fbd58938e4324ac03B58d812b0E1",
  Decimals: 8,
};
const KNC = {
  Symbol: "KNC",
  TokenAddr: "0x3f80c39c0b96a0945f9f0e9f55d8a8891c5671a8",
  aTokenAddr: "0xdDdEC78e29f3b579402C42ca1fd633DE00D23940",
  Pricefeed: "0xf8fF43E991A81e6eC886a3D281A2C6cC19aE70Fc",
  Decimals: 8,
};
const SNX = {
  Symbol: "SNX",
  TokenAddr: "0x7fdb81b0b8a010dd4ffc57c3fecbf145ba8bd947",
  aTokenAddr: "0xAA74AdA92dE4AbC0371b75eeA7b1bd790a69C9e1",
  Pricefeed: "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
  Decimals: 8,
};

const toWei = (x) => {
  return (x * 10 ** 18).toString();
};

const fromWei = (x) => {
  return (x / 10 ** 18).toString();
};

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
    await pub.createPool(symbol, poolName, targetPrice, {
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
    await pvt.createPool(
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
      await pvt.verifyPoolAccess(
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
      value: toWei("0.5"),
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

async function populatePool(poolName, Token, maxAmount, typePrivate) {
  token = await ERC20.at(Token.TokenAddr);

  console.log("\n--Depositing tokens in a pool--\n");

  if (typePrivate) {
    for (i = 1; i < 5; i++) {
      await token.approve(comp.address, toWei(maxAmount / i), {
        from: accounts[i],
      });
      await comp.depositERC20(poolName, toWei(maxAmount / i), typePrivate, {
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
  } else {
    for (i = 1; i < 5; i++) {
      await token.approve(comp.address, toWei(maxAmount / i), {
        from: accounts[i],
      });
      await comp.depositERC20(poolName, toWei(maxAmount / i), typePrivate, {
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
  }

  console.log("\nSuccessfull!\n");
}

async function dePopulatePool(poolName, Token, typePrivate) {
  token = await ERC20.at(Token.TokenAddr);
  console.log("\n--Withdrawing tokens from a pool--\n");

  for (i = 1; i < 5; i++) {
    await comp.withdrawERC20(poolName, 0, typePrivate, { from: accounts[i] });
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

async function depositByUser(poolName, amount, Token, typePrivate, user) {
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
  await comp.depositERC20(poolName, amount, typePrivate, { from: user });
  console.log(
    Token.Symbol,
    " balance of ",
    user,
    " : ",
    parseInt(await token.balanceOf(user))
  );

  console.log("\nSuccessfull!\n");
}

async function withdrawByUser(poolName, amount, Token, typePrivate, user) {
  token = await ERC20.at(Token.TokenAddr);
  console.log("\n--Withdrawal by ", user, " initiated--\n");

  await comp.withdrawERC20(poolName, amount, typePrivate, { from: user });
  console.log(
    Token.Symbol,
    " balance of ",
    user,
    " : ",
    parseInt(await token.balanceOf(user))
  );

  console.log("\nSuccessfull\n");
}

let accounts;
module.exports = async function (callback) {
  accounts = await web3.eth.getAccounts();
  [admin, user1, user2, user3, _] = accounts;

  comp = await Comptroller.deployed();
  pvt = await PrivatePools.deployed();
  pub = await PublicPools.deployed();
  don = await DonationPools.deployed();
  link = await ERC20.at(LINK.TokenAddr);
  uni = await ERC20.at(UNI.TokenAddr);
  yfi = await ERC20.at(YFI.TokenAddr);
  knc = await ERC20.at(KNC.TokenAddr);
  snx = await ERC20.at(SNX.TokenAddr);

  console.log("\n--Starting up the migrations--\n");
  console.log("Admin ETH balance: ", await web3.eth.getBalance(admin));
  console.log("Admin LINK balance: ", parseInt(await link.balanceOf(admin)));
  console.log("Admin UNI balance: ", parseInt(await uni.balanceOf(admin)));
  console.log("Admin YFI balance: ", parseInt(await yfi.balanceOf(admin)));
  console.log("Admin KNC balance: ", parseInt(await knc.balanceOf(admin)));
  console.log("Admin SNX balance: ", parseInt(await snx.balanceOf(admin)));

  await fundAccountsETH();
  await fundAccountsERC20(LINK, 50);
  await fundAccountsERC20(UNI, 50);
  await fundAccountsERC20(YFI, 0.1);
  await fundAccountsERC20(KNC, 100);
  await fundAccountsERC20(SNX, 1);

  // Adding token data to the comptroller contract
  await addToken(LINK);
  await addToken(UNI);
  await addToken(YFI);
  await addToken(KNC);
  await addToken(SNX);

  // Adding recipients to the Donation pool contract
  await addRecipient(admin, "DEV");

  // Creating a few public pools
  await createPool(LINK.Symbol, "LPUBLIC", 35, false);
  // await createPool(UNI.Symbol, "UPUBLIC", 35, false);
  // await createPool(YFI.Symbol, "YPUBLIC", 50000, false);
  await createPool(KNC.Symbol, "KPUBLIC", 5, false);
  await createPool(SNX.Symbol, "SPUBLIC", 25, false);

  //Creating a few private pools
  await createPool(LINK.Symbol, "LPRIVATE", 35, true, user1);
  // await createPool(UNI.Symbol, "UPRIVATE", 35, true, user2);
  await createPool(YFI.Symbol, "YPRIVATE", 50000, true, user3);

  console.log("\nPopulating public pools\n");

  await populatePool("LPUBLIC", LINK, 10, false);
  await populatePool("KPUBLIC", KNC, 100, false);
  await populatePool("SPUBLIC", SNX, 1, false);

  console.log("\nPopulating private pools\n");

  await populatePool("LPRIVATE", LINK, 10, true);
  await populatePool("YPRIVATE", YFI, 0.1, true);
  // await populatePool("UPRIVATE", UNI, 10, true);

  callback("Completed");
};
