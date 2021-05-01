const truffleAssert = require("truffle-assertions");
const Comptroller = artifacts.require("Comptroller");
const Pools = artifacts.require("Pools");
const DonationPools = artifacts.require("DonationPools");
const ERC20 = artifacts.require("IERC20");

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

const toWei = (x) => {
  return (x * 10 ** 18).toString();
};

const fromWei = (x) => {
  return (x / 10 ** 18).toString();
};

contract("--Pools testing--", (accounts) => {

  beforeEach(async () => {
    // accounts = await web3.eth.getAccounts();
    [admin, user1, user2, user3, _] = accounts;

    comp = await Comptroller.deployed();
    pools = await Pools.deployed();

    await comp.addTokenData(
      LINK.Symbol,
      LINK.TokenAddr,
      LINK.aTokenAddr,
      LINK.Pricefeed,
      LINK.Decimals
    );

    await comp.addTokenData(
      BAT.Symbol,
      BAT.TokenAddr,
      BAT.aTokenAddr,
      BAT.Pricefeed,
      BAT.Decimals
    );

  });

  it("Cannot create Pool with no name", async () => {
    await truffleAssert.reverts(
      pools.createPool("LINK", "", 50, '0x0000000000000000000000000000000000000000', {
        from: admin,
      }),
      "Pool name can't be empty !"
    );
  });

  // This test would have failed for the older versions of contracts where only owners were allowed to create a public
  // it("Only owner can create the Pool", async () => {
  //   await truffleAssert.reverts(
  //     pools.createPool("LINK", "myPool45", 45, '0x0000000000000000000000000000000000000000', {
  //       from: user1,
  //     }),
  //     "Ownable: caller is not the owner"
  //   );
  // });

  it("Cannot create Pool with no token symbol", async () => {
    await truffleAssert.reverts(
      pools.createPool("", "myPool45", 50, '0x0000000000000000000000000000000000000000', {
        from: admin,
      }),
      "Token symbol can't be empty !"
    );
  });

  it("Cannot create Pool with same name", async () => {
    // console.log("Creating Duplicate Pool...");
    await pools.createPool("LINK", "myPool45", 50, '0x0000000000000000000000000000000000000000', {
      from: admin,
    });

    await truffleAssert.reverts(
      pools.createPool("LINK", "myPool45", 50, '0x0000000000000000000000000000000000000000', {
        from: admin,
      }),
      "Pool name already taken !"
    );
  });

  it("Cannot create Pool with same name but different token symbol", async () => {
    await pools.createPool("LINK", "myPool45", 50, '0x0000000000000000000000000000000000000000', {
      from: admin,
    });
    await truffleAssert.reverts(
      pools.createPool("BAT", "myPool45", 50, '0x0000000000000000000000000000000000000000', {
        from: admin,
      }),
      "Pool name already taken !"
    );
  });
});
