const Comptroller = artifacts.require("Comptroller");
const PrivatePools = artifacts.require("PrivatePools")
const PublicPools = artifacts.require("PublicPools");
const DonationPools = artifacts.require("DonationPools");


describe("Creating pools",  () => {
    before(async() => {
        accounts = await web3.eth.getAccounts();
        admin = accounts[0];
        recipient1 = accounts[1];
        recipient2 = accounts[2];
        user1 = accounts[3];
        user2 = accounts[4];

        comptroller = await Comptroller.deployed();
        privatePools = await PrivatePools.deployed();
        publicPools = await PublicPools.deployed();
        donationPool = await DonationPools.deployed();

        await comptroller.addTokenData(
            "LINK",
            "0xa36085F69e2889c224210F603D836748e7dC0088",
            "0xa06bc25b5805d5f8d82847d191cb4af5a3e873e0",
            "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
            8
        );

        console.log("Token data: ", await comptroller.tokenData("LINK"));
    });

    it("Should add a recipient to donation pools contract", async() => {
        await donationPool.addRecipient(recipient1, "WWF");
        console.log("Donation Pool creation result: ", await donationPool.recipients(recipient1));
    });

    it("Should create a public pool", async() => {
        await publicPools.createPool(
            "LINK",
            "TEST",
            50
        );
        console.log("Public pool creation result: ", await publicPools.poolNames("TEST"));
    });
});