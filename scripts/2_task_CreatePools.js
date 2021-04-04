
const Comptroller = artifacts.require("../contracts/Pools/Comptroller.sol");
const PrivatePools = artifacts.require("../contracts/Factory/PrivatePools");
const PublicPools = artifacts.require("../contracts/Factory/PublicPools");
const DonationPools = artifacts.require("../contracts/Pools/DonationPools.sol");
const ERC20 = artifacts.require("IERC20");
const linkAddress = '0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789';
const aLinkAddress = '0xa06bc25b5805d5f8d82847d191cb4af5a3e873e0';

contract("Everything", async (accounts) => {
    const admin = accounts[0]; 
    const user1 = accounts[1];
    console.log("Chainlink rules");
    // before(async () => {
    //     comp = await Comptroller.new();
    //     privatepool = await PrivatePools.new(comp.address);
    //     publicpools = await PublicPools.new(comp.address);
    //     donationpools = await DonationPools.new(comp.address);

    // });
    try {
            const link = await ERC20.at(linkAddress);
            console.log(parseInt(await link.balanceOf(admin)));
        } catch (error) {
            console.log(error);
    }

    before(async() => {
        comp = await Comptroller.new();
        privatepool = await PrivatePools.new(comp.address);
        publicpools = await PublicPools.new(comp.address);
        donationpools = await DonationPools.new(comp.address);

        comp.addTokenData(
            "LINK",
            "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
            "0xa06bc25b5805d5f8d82847d191cb4af5a3e873e0",
            "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
            8
        );
                
        console.log("Token data: ", await comp.tokenData("LINK"));
    });


    it("Public pool created", async () => {
        const pool = await publicpools.createPool("LINK", "Test1", 45, {from: admin});
        console.log(pool);
    });

    it("User1 Deposited 1 LINK", async () => {    
        //allowance    
        link.approve(comp.address, 1*10**18,{from: User1});
        const deposit = await comp.depositERC20("Test1", 1*10**18, "LINK", false, {from: User1, gas: 10**7});
        console.log(deposit);
    });


    // before(async() => {
    //     const [admin,recipient1,recipient2,user1,user2,_] = await web3.eth.getAccounts();

    //     comptroller = await Comptroller.deployed();
    //     privatePools = await PrivatePools.deployed();
    //     publicPools = await PublicPools.deployed();
    //     donationPool = await DonationPools.deployed();

    //     await comptroller.addTokenData(
    //         "LINK",
    //         "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
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

    // it("Should be able to deposit", async() => {
    //     await comptroller.depositERC20(
    //         "TEST",
    //         "1", // 1 Link so convert this to wei
    //         "LINK",
    //         false,
    //         { from: user1 }
    //     );

    //     console.log("Deposit completed !");
    // });

});
