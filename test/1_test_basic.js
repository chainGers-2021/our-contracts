const Comptroller = artifacts.require("Comptroller");
const PrivatePools = artifacts.require("PrivatePools");
const PublicPools = artifacts.require("PublicPools");
const DonationPools = artifacts.require("DonationPools");
const ERC20 = artifacts.require("IERC20");
const linkAddress = "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789";
const aLinkAddress = "0xa06bc25b5805d5f8d82847d191cb4af5a3e873e0";

contract("~our-contracts~", async (accounts) => {
  const [admin, user1, user2, _] = accounts;

  it("is working.", async () => {
    link = await ERC20.at(linkAddress);

    console.log("ETH balance: ", await web3.eth.getBalance(admin));
    console.log("LINK balance: ", parseInt(await link.balanceOf(admin)));

    comp = await Comptroller.new();
    privatepool = await PrivatePools.new(comp.address);
    publicpools = await PublicPools.new(comp.address);
    donationpools = await DonationPools.new(comp.address);

    await comp.addTokenData(
      "LINK",
      "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
      "0xa06bc25b5805d5f8d82847d191cb4af5a3e873e0",
      "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
      8
    );

    console.log("Token data: ", await comp.tokenData("LINK"));
    await publicpools.createPool("LINK", "Test1", 45, {
      from: admin,
    });
  });
});
