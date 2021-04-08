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

module.exports = async function (deployer) {
    const accounts = await web3.eth.getAccounts();
    const [admin, user1, user2, _] = accounts;
    comp = await Comptroller.deployed();
    pvt = await PrivatePools.deployed();
    pub = await PublicPools.deployed();
    don = await DonationPools.deployed();
    link = await ERC20.at(linkAddress);

    console.log("Starting up the migrations...");
    console.log("Admin ETH balance: ", await web3.eth.getBalance(admin));
    console.log("Admin LINK balance: ", parseInt(await link.balanceOf(admin)));

    console.log(await comp.setPoolAddresses(
        pvt.address,
        pub.address,
        don.address
    ));

    console.log(await comp.addTokenData(
        "LINK",
        linkAddress,
        aLinkAddress,
        "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
        8
    ));


    // Adding a recipient of the donation amounts
    await don.addRecipient(
        admin,
        "DEV"
    );

    // Creating public pool
    console.log(await pub.createPool("LINK", "Test1", 45, {
        from: admin,
    }));

    // Transferring tokens to other accounts from admin account
    for (i = 1; i < 5; i++) {
        console.log(await link.transfer(accounts[i], toWei(10)));
        console.log(await web3.eth.sendTransaction({ to: accounts[i], from: admin, value: toWei("0.1") }))
    }

    // depositing into a pool
    for (i = 1; i < 5; i++) {
        console.log(await link.approve(comp.address, toWei(1), { from: accounts[i] }));
        console.log(await comp.depositERC20("Test1", toWei(1), false, { from: accounts[i] }));
        console.log("User scaled amount: ", (await pub.getUserScaledDeposit("Test1", { from: accounts[i] })).toString());
        console.log("LINK balance of ", i, " : ", parseInt(await link.balanceOf(accounts[i])));
    }


    // Manually Pool Break 
    console.log(await pub.breakPool("Test1", { from: admin }));

    for (i = 1; i < 5; ++i) {
        await comp.withdrawERC20("Test1", 0, false, { from: accounts[i] });
        console.log("User scaled amount: ", (await pub.getUserScaledDeposit("Test1", { from: accounts[i] })).toString());
        console.log("LINK balance of ", i, " : ", parseInt(await link.balanceOf(accounts[i])));
    }
    console.log("LINK balance of admin: ", parseInt(await link.balanceOf(admin)));

    const iscal = await IScaledBalanceToken.at(aLinkAddress);
    console.log("Pool scaled balance: ", parseInt(await iscal.scaledBalanceOf(comp.address)));

    // Donation Pool Amount Withdrawal
    await comp.withdrawDonation("LINK");
    console.log("Donation withdrawal successfull");
    console.log("LINK balance of admin: ", parseInt(await link.balanceOf(admin)));
    console.log("Pool scaled balance: ", parseInt(await iscal.scaledBalanceOf(comp.address)));

    console.log("--End of PublicPools Testing--");
};