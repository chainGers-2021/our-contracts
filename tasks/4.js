// const web3 = require("web3");

async function test4() {
    accounts = await web3.eth.getAccounts();
    for(i=0;i<accounts.length;i++){
        console.log(await web3.eth.getBalance(accounts[i]));
    }
    
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0x59a506C065B36fB906D8c0dFb32A951ef14B1CE5"]
    });

    accounts = await web3.eth.getAccounts();
    for(i=0;i<accounts.length;i++){
        console.log(await web3.eth.getBalance(accounts[i]));
    }
}

module.exports = { test4 };
