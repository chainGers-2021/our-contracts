const Comptroller = artifacts.require("Comptroller");
const PrivatePools = artifacts.require("PrivatePools")
const PublicPools = artifacts.require("PublicPools");
const DonationPools = artifacts.require("DonationPools");
const ERC20 = artifacts.require("IERC20");

const linkAddress = '0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789';
const aLinkAddress = '0xa06bc25b5805d5f8d82847d191cb4af5a3e873e0';

module.exports = async (callback) => {
    const [admin, user1, user2, _] = await web3.eth.getAccounts();

    // const comp = await Comptroller.deployed();
    // const pvt = await PrivatePools.deployed();
    // const pub = await PublicPools.deployed();
    // const don = await DonationPools.deployed();

    try {
        const link = await ERC20.at(linkAddress);
        console.log(parseInt(await link.balanceOf(admin)));
    } catch (error) {
        console.log(error);
    }

    // it("is working fine.", async()=>{
    //     console.log("Hello");
    // });

    // before(async() => {
    //     const [admin,recipient1,recipient2,user1,user2,_] = await web3.eth.getAccounts();

    //     comptroller = await Comptroller.deployed();
    //     privatePools = await PrivatePools.deployed();
    //     publicPools = await PublicPools.deployed();
    //     donationPool = await DonationPools.deployed();

    //     await comptroller.addTokenData(
    //         "LINK",
    //         "0xa36085F69e2889c224210F603D836748e7dC0088",
    //         "0xa06bc25b5805d5f8d82847d191cb4af5a3e873e0",
    //         "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
    //         8
    //     );

    //     console.log("Token data: ", await comptroller.tokenData("LINK"));
    // });

    // it("Should add a recipient to donation pools contract", async() => {
    //     await donationPool.addRecipient(recipient1, "WWF");
    //     console.log("Donation Pool creation result: ", await donationPool.recipients(recipient1));
    // });

    // it("Should create a public pool", async() => {
    //     await publicPools.createPool(
    //         "LINK",
    //         "TEST",
    //         50
    //     );
    //     console.log("Public pool creation result: ", await publicPools.poolNames("TEST"));
    // });

    callback(0);
}


