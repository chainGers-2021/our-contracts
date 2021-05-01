const truffleAssert = require("truffle-assertions");
const Comptroller = artifacts.require("Comptroller");
const Pools = artifacts.require("Pools");
const DonationPools = artifacts.require("DonationPools");
const ERC20 = artifacts.require("IERC20");

const toWei = (x) => {
  return (x * 10 ** 18).toString();
};

const fromWei = (x) => {
  return (x / 10 ** 18).toString();
};

let comp, pvt, pub, don;
describe("--Pools testing--", () => {

  before( async() =>{
    accounts = await web3.eth.getAccounts();
    [admin, user1, user2, user3, _] = accounts;

    pools = await Pools.deployed();
  });

  it("Cannot create Pool with no name", async () => {
    await truffleAssert.reverts(
      pools.createPool("LINK", "", 45, '0x0000000000000000000000000000000000000000', {
        from: admin,
      }),
      "Pool name can't be empty !"
    );
  });

  it("Only owner can create the Pool", async () => {
    await truffleAssert.reverts(
      pools.createPool("LINK", "myPool45", 45, '0x0000000000000000000000000000000000000000', {
        from: user1,
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("Cannot create Pool with no token symbol", async () => {
    await truffleAssert.reverts(
      pools.createPool("", "myPool45", 45, '0x0000000000000000000000000000000000000000', {
        from: admin,
      }),
      "Token symbol can't be empty !"
    );
  });

  it("Cannot create Pool with same name", async () => {
    // console.log("Creating Duplicate Pool...");
    await truffleAssert.reverts(
      pools.createPool("LINK", "myPool45", 45, '0x0000000000000000000000000000000000000000', {
        from: admin,
      }),
      "Pool name already taken !"
    );
  });

  it("Cannot create Pool with same name but different token symbol", async () => {
    await truffleAssert.reverts(
      pools.createPool("WBTC", "myPool45", 45, '0x0000000000000000000000000000000000000000', {
        from: admin,
      }),
      "Pool name already taken !"
    );
  });
});
