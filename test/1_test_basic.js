const assert = require('assert');
const truffleAssert = require('truffle-assertions');
const Comptroller = artifacts.require("Comptroller");
const PrivatePools = artifacts.require("PrivatePools");
const PublicPools = artifacts.require("PublicPools");
const DonationPools = artifacts.require("DonationPools");
const ERC20 = artifacts.require("IERC20");
const IScaledBalanceToken = artifacts.require("IScaledBalanceToken");

const linkAddress = "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789";
const aLinkAddress = "0xeD9044cA8F7caCe8eACcD40367cF2bee39eD1b04";

const toWei = (x) => {
  return (x * 10 ** 18).toString();
}

const fromWei = (x) => {
  return (x / 10 ** 18).toString();
}

contract("--PublicPools testing--", async (accounts) => {
  const [admin, user1, user2, _] = accounts;

  before("Deploying contracts", async () => {
    link = await ERC20.at(linkAddress);
    console.log("Admin ETH balance: ", await web3.eth.getBalance(admin));
    console.log("Admin LINK balance: ", parseInt(await link.balanceOf(admin)));

    comp = await Comptroller.new();
    pvt = await PrivatePools.new(comp.address);
    pub = await PublicPools.new(comp.address);
    don = await DonationPools.new(comp.address);

    const setPoolAddresses = await comp.setPoolAddresses(
      pvt.address,
      pub.address,
      don.address
    );

    const addTokenData = await comp.addTokenData(
      "LINK",
      "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
      "0xeD9044cA8F7caCe8eACcD40367cF2bee39eD1b04",
      "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
      8
    );

    // Adding a recipient of the donation amounts
    const addRecipient = await don.addRecipient(
      admin,
      "DEV"
    );

    // Creating public pool
    const createPool = await pub.createPool("LINK", "Test1", 45, {
      from: admin,
    });
    console.log(createPool.logs);

    for (i = 1; i < 5; i++) {
      const transferLink = await link.transfer(accounts[i], toWei(10));
      const sendtx = await web3.eth.sendTransaction({ to: accounts[i], from: admin, value: toWei("0.5") });
    }

    //Initial balances
    console.log("Initial balances: ");
    for (i = 1; i < 5; i++) {
      console.log("LINK balance of ", i, " : ", parseInt(await link.balanceOf(accounts[i])));
    }
  });

  it("Cannot create Pool with no name", async () => {
    const createNamelessPool = await pub.createPool("LINK", "", 45, {
      from: admin,
    });
    //console.log(createNamelessPool.logs);
    assert.isUndefined(pub.poolNames[""],"No pool with blank name exists");
  });

  // it("Only owner can create the Pool", async () => {
  //     try {
  //       await pub.createPool("LINK", "Test2", 45, {
  //         from: user1,
  //         });
  //     } 
  //     catch (err) {
  //       assert.exists(err.message);
  //     }
  // });

  it("Cannot create Pool with no token symbol", async () => {
    await pub.createPool("", "Test3", 45, {
      from: admin,
    });
    assert.isUndefined(pub.poolNames["Test3"],"Pool with blank symbol not exists");
  });

  it("Cannot create Pool with same name", async () => {
    try {
      console.log("Creating Duplicate Pool...");
      await pub.createPool("LINK", "Test1", 45, {
      from: admin,
      });
    } 
    catch (err) {
      assert.exists(err);
      console.log(err+ "As duplicate pool cannot be created");
      }
  });

  //-------------------TO DO------------------
  //Error is not logged after creating a pool as such below
  //Need to write code to do that
  it("Cannot create Pool with same name but different token symbol", async () => {
    // try {
    //   console.log("Creating Duplicate Pool with ETH token...");
    //   createDuplicatePool = await pub.createPool("ETH", "Test1", 45, {
    //   from: admin,
    //   });
    //   console.log(createDuplicatePool);
    // } 
    // catch (err) {
    //   assert.exists(err);
    //   console.log(err+ "As duplicate pool with different token cannot be created");
    //   }
    await truffleAssert.reverts(
      pub.createPool("ETH", "Test1", 45, {
        from: admin,
      }),
        "Pool name already taken !"
    );
  });

  it("Allows users to deposit LINK", async () => {
    // depositing into a pool
    console.log("Balances after Deposit: ")
    for (i = 1; i < 5; i++) {
      const linkApprove = await link.approve(comp.address, toWei(1), { from: accounts[i] });
      const depositERC20 = await comp.depositERC20("Test1", toWei(1), "LINK", false, { from: accounts[i] });
      const userScaledAmount =  (await pub.getUserScaledDeposit("Test1", { from: accounts[i] })).toString();
      console.log("User scaled Amount: ", userScaledAmount);
      console.log("LINK balance of ", i, " : ", parseInt(await link.balanceOf(accounts[i])));
    }
  });

  it("allows users to withdraw their stake(LINK)", async () => {
    // state change
    // console.log(await pub.breakPool("Test1", {from: admin}));
    console.log("Balances after withdrawal: ");
    for (i = 1; i < 5; ++i) {
      await comp.withdrawERC20("Test1", toWei(0.5), false, { from: accounts[i] });
      const userScaledAmount = (await pub.getUserScaledDeposit("Test1", { from: accounts[i] })).toString();
      console.log("User Scaled Amount: ", userScaledAmount);
      console.log("LINK balance of ", i, " : ", parseInt(await link.balanceOf(accounts[i])));
    }
    console.log("LINK balance of admin: ", parseInt(await link.balanceOf(admin)));

    const iscal = await IScaledBalanceToken.at(aLinkAddress);
    console.log("Pool scaled balance: ", parseInt(await iscal.scaledBalanceOf(comp.address)));
  });

  // it("Allows recipients of donation pools to withdraw their stake", async () => {
  //   await comp.withdrawDonation("LINK");
  //   console.log("Donation withdrawal successfull");
  //   console.log("LINK balance of admin: ", parseInt(await link.balanceOf(admin)));
  //   console.log("Pool scaled balance: ", parseInt(await iscal.scaledBalanceOf(comp.address)));
  // });

  console.log("--End of PublicPools Testing");
});

// contract("--PrivatePools Testing--", async (accounts) => {
//   const [admin, user1, user2, _] = accounts;

//   before("Deploying contracts", async () => {
//     link = await ERC20.at(linkAddress);
//     console.log("Admin ETH balance: ", await web3.eth.getBalance(admin));
//     console.log("Admin LINK balance: ", parseInt(await link.balanceOf(admin)));

//     comp = await Comptroller.new();
//     pvt = await PrivatePools.new(comp.address);
//     pub = await PublicPools.new(comp.address);
//     don = await DonationPools.new(comp.address);
//     // comp = await Comptroller.deployed();
//     // pvt = await PrivatePools.deployed();
//     // pub = await PublicPools.deployed();
//     // don = await DonationPools.deployed();

//     await comp.setPoolAddresses(
//       pvt.address,
//       pub.address,
//       don.address
//     );

//     await comp.addTokenData(
//       "LINK",
//       "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
//       "0xeD9044cA8F7caCe8eACcD40367cF2bee39eD1b04",
//       "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
//       8
//     );

//     // Adding a recipient of the donation amounts
//     await don.addRecipient(admin, "DEV");

//     newPoolAccount = await web3.eth.accounts.create();

//     // Creating private pool
//     await pvt.createPool("LINK", "Test1", 45, newPoolAccount.address, {
//       from: admin,
//     });

//     for (i = 1; i < 5; i++) {
//       await link.transfer(accounts[i], toWei(10));
//       await web3.eth.sendTransaction({ to: accounts[i], from: admin, value: toWei("0.5") });
//     }
//   });

//   it("Should be able to verify users", async () => {
//     for (i = 1; i < 5; ++i) {
//       someText = await web3.utils.randomHex(32);
//       signObject = await web3.eth.accounts.sign(someText, newPoolAccount.privateKey);
//       await pvt.verifyPoolAccess(
//         "Test1",
//         signObject.messageHash,
//         signObject.signature,
//         { from: accounts[i] }
//       );

//       console.log("Pool access authorised for user ", i);
//     }
//   });

//   it("allows users to deposit LINK", async () => {
//     // depositing into a pool
//     for (i = 1; i < 5; i++) {
//       await link.approve(comp.address, toWei(1), { from: accounts[i] });
//       await comp.depositERC20("Test1", toWei(1), "LINK", true, { from: accounts[i] });
//       console.log("User scaled amount: ", (await pvt.getUserScaledDeposit("Test1", { from: accounts[i] })).toString());
//       console.log("LINK balance of ", i, " : ", parseInt(await link.balanceOf(accounts[i])));
//     }
//   });

//   it("allows users to withdraw their stake(LINK)", async () => {
//     // state change
//     await pvt.breakPool("Test1", { from: admin });

//     for (i = 1; i < 5; ++i) {
//       await comp.withdrawERC20("Test1", 0, true, { from: accounts[i] });
//       console.log("User scaled amount: ", (await pvt.getUserScaledDeposit("Test1", { from: accounts[i] })).toString());
//       console.log("LINK balance of ", i, " : ", parseInt(await link.balanceOf(accounts[i])));
//     }

//     console.log("LINK balance of admin: ", parseInt(await link.balanceOf(admin)));

//     iscal = await IScaledBalanceToken.at(aLinkAddress);
//     console.log("Pool scaled balance: ", parseInt(await iscal.scaledBalanceOf(comp.address)));
//   });

//   it("Allows recipients of donation pools to withdraw their stake", async () => {
//     await comp.withdrawDonation("LINK");
//     console.log("Donation withdrawal successfull");
//     console.log("LINK balance of admin: ", parseInt(await link.balanceOf(admin)));
//     console.log("Pool scaled balance: ", parseInt(await iscal.scaledBalanceOf(comp.address)));
//   });

//   console.log("--End of PublicPools Testing");
// });