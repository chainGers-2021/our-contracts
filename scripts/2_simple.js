require("dotenv").config();
const f_mnemonic = process.env.f_MNEMONIC;
const f_url = process.env.f_RPC_URL;
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const truffle = require("truffle");

const Comptroller = require("./../truffle-build/Comptroller.json");

let provider = new HDWalletProvider({
  mnemonic: {
    phrase: f_mnemonic,
  },
  providerOrUrl: f_url,
});

const web3 = new Web3(provider);

const main = async () => {
  accounts = await web3.eth.getAccounts();

  const comp = await new web3.eth.Contract(Comptroller.abi)
    .deploy({ data: Comptroller.bytecode })
    .send({ from: accounts[0] });

  console.log(comp.options.address);

  return process.exit(0);
};
main();
