const truffleAssert = require("truffle-assertions");
const Comptroller = artifacts.require("Comptroller");
const Pools = artifacts.require("Pools");
const DonationPools = artifacts.require("DonationPools");
const ERC20 = artifacts.require("IERC20");
const IScaledBalanceToken = artifacts.require("IScaledBalanceToken");

const WETH = {
    Symbol: "WETH",
    TokenAddr: "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
    aTokenAddr: "0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347",
    Pricefeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
    Decimals: 8,
}

const toWei = (x) => {
    return (x * 10 ** 18).toString();
};

const fromWei = (x) => {
    return (x / 10 ** 18).toString();
};

const ScaledBalance = async (aTokenAddr) => {
    iscal = await IScaledBalanceToken.at(aTokenAddr);
    return parseInt(await iscal.scaledBalanceOf(comp.address));
}

contract("--Pools testing--", (accounts) => {
    before(async () => {
        [admin, user1, user2, user3, _] = accounts;

        console.log("Admin ETH balance: ", await web3.eth.getBalance(admin));

        comp = await Comptroller.deployed();
        pools = await Pools.deployed();

        await comp.addTokenData(
            WETH.Symbol,
            WETH.TokenAddr,
            WETH.aTokenAddr,
            WETH.Pricefeed,
            WETH.Decimals
        );

        await pools.createPool(
            "WETH",
            "WPUBLIC",
            5000,
            '0x0000000000000000000000000000000000000000',
            { from: admin }
        );

        aWeth = await ERC20.at(WETH.aTokenAddr);
    });

    it("Should be able to deposit ETH", async () => {
        console.log("Pool scaled balance before deposit: ", await ScaledBalance(WETH.aTokenAddr));
        await comp.depositETH("WPUBLIC", { from: admin, value: toWei(1) });
        console.log("Pool scaled balance after deposit: ", await ScaledBalance(WETH.aTokenAddr));
    });

    it("Should be able to withdraw ETH", async() => {
        console.log("Admin ETH balance before withdrawal: ", await web3.eth.getBalance(admin));
        await comp.withdrawETH("WPUBLIC", toWei(0), { from: admin });
        console.log("Admin ETH balance after withdrawal: ", await web3.eth.getBalance(admin));
        console.log("Pool scaled balance after withdrawal: ", await ScaledBalance(WETH.aTokenAddr));
        console.log("aWETH balance after withdrawal: ", parseInt(await aWeth.balanceOf(comp.address)));
    });
});