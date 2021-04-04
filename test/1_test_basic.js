const Comptroller = artifacts.require("Comptroller");
const PrivatePools = artifacts.require("PrivatePools");
const PublicPools = artifacts.require("PublicPools");
const DonationPools = artifacts.require("DonationPools");
const ERC20 = artifacts.require("IERC20");
const linkAddress = "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789";
const aLinkAddress = "0xa06bc25b5805d5f8d82847d191cb4af5a3e873e0";

const toWei = (x)=>{
  return (x*10**18).toString();
}
const fromWei = (x)=>{
  return (x/10**18).toString();
}

contract("~our-contracts~", async (accounts) => {
  const [admin, user1, user2, _] = accounts;

  before("is working.", async () => {
    link = await ERC20.at(linkAddress);
    console.log("ETH balance: ", await web3.eth.getBalance(admin));
    console.log("LINK balance: ", parseInt(await link.balanceOf(admin)));

    comp = await Comptroller.new();
    pvt = await PrivatePools.new(comp.address);
    pub = await PublicPools.new(comp.address);
    don = await DonationPools.new(comp.address);

    await comp.setPoolAddresses(
      pvt.address,
      pub.address,
      don.address
    );

    await comp.addTokenData(
      "LINK",
      "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
      "0xa06bc25b5805d5f8d82847d191cb4af5a3e873e0",
      "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
      8
    );
  });
  
  it("user1 Deposited 1 LINK", async () => {
    // creating pool
    await pub.createPool("LINK", "Test1", 45, {
      from: admin,
    });
    
    // depositing into a pool
    tx1 = await link.approve(comp.address, toWei(1), { from: admin });
    tx2 = await comp.depositERC20("Test1", toWei(1), "LINK", false, { from: admin });

    console.log("User scaled amount: ", (await pub.getPoolScaledAmount("Test1")).toString());
  });
});
