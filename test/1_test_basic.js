const Comptroller = artifacts.require("Comptroller");
const PrivatePools = artifacts.require("PrivatePools");
const PublicPools = artifacts.require("PublicPools");
const DonationPools = artifacts.require("DonationPools");
const ERC20 = artifacts.require("IERC20");
const IScaledBalanceToken = artifacts.require("IScaledBalanceToken");



const linkAddress = "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789";
const aLinkAddress = "0xeD9044cA8F7caCe8eACcD40367cF2bee39eD1b04";

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
    // comp = await Comptroller.deployed();
    // pvt = await PrivatePools.deployed();
    // pub = await PublicPools.deployed();
    // don = await DonationPools.deployed();

    console.log(await comp.setPoolAddresses(
      pvt.address,
      pub.address,
      don.address
    ));

    console.log(await comp.addTokenData(
      "LINK",
      "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
      "0xeD9044cA8F7caCe8eACcD40367cF2bee39eD1b04",
      "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
      8
    ));

    // Creating public pool
    console.log(await pub.createPool("LINK", "Test1", 45, {
      from: admin,
    }));

    for(i=1;i<5;i++){
      console.log(await link.transfer(accounts[i], toWei(10)));
      console.log(await web3.eth.sendTransaction({to:accounts[i], from:admin, value:toWei("0.5")}))
    }
  });
  
  it("allows users to deposit LINK", async () => {
    // depositing into a pool
    for(i=1;i<5;i++){
      console.log(await link.approve(comp.address, toWei(1), { from: accounts[i] }));
      console.log(await comp.depositERC20("Test1", toWei(1), "LINK", false, { from: accounts[i] }));
      console.log("User scaled amount: ", (await pub.getUserScaledDeposit("Test1", {from: accounts[i]})).toString());
      console.log("LINK balance of ${i}: ", parseInt(await link.balanceOf(accounts[i])));
    }

  });

  it("allows users to withdraw their stake(LINK)", async() => {
    // state change
    console.log(await pub.breakPool("Test1", {from: admin}));

    // try {
    //   await link.approve(comp.address, toWei(1), { from: accounts[0] });
    //   await comp.depositERC20("Test1", toWei(1), "LINK", false, { from: accounts[0] });
    //   assert(false);
    // } catch (error) {
    // }
    
    for(i = 1; i<5; ++i){
      await comp.withdrawERC20("Test1", 0, false, {from: accounts[i]});
      console.log("User scaled amount: ", (await pub.getUserScaledDeposit("Test1", {from: accounts[i]})).toString());
      console.log("LINK balance of ", i, " : ", parseInt(await link.balanceOf(accounts[i])));
    }
    
    
    iscal = await IScaledBalanceToken.at(aLinkAddress);
    console.log("Pool scaled balance: ", 	parseInt(await iscal.scaledBalanceOf(comp.address)));
  });

});
