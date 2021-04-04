const Web3 = require('web3');
const linkAbi = require('./link_abi.js');

const address1 = "0x3A7bADc387eA16034529B726d157e5079D3C4f7d";

const unlockedadd = "0x4b5e285EB95822d6b6C6936F5a4727A514E808Ab";
const linkMainnet = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
const web3 = new Web3('http://localhost:7545');
const link = new web3.eth.Contract(
	linkAbi,
	linkMainnet
);

async function run() {
	let unlockedbalance, address1balance;
	([unlockedbalance, address1balance] = await Promise.all(
		link.methods
			.balanceOf([unlockedadd])
			.call(),
		link.methods
			.balanceOf([address1])
			.call(),
		));
	console.log(`'Balance of unlockedadd : ', ${unlockedbalance}`);
	console.log(`'Balance of address1: ', ${address1balance}`);

	await link.methods
		.transfer(address1, 1000)
		.send({from: unlockedadd});

	([unlockedbalance, address1balance] = await Promise.all(
		link.methods
			.balanceOf([unlockedadd])
			.call(),
		link.methods
			.balanceOf([address1])
			.call(),
		));
	console.log(`'Balance of unlockedadd : ', ${unlockedbalance}`);
	console.log(`'Balance of address1: ', ${address1balance}`);
}

run();
// Addresses to hold Link Token
// 0xcb8b4aA1D32A0DF459847151dD89A93bEa3bdAe1
// 0xE947e36b8158a3053B29FB95c10524f2a267F0C6
// 0x1B8B864909AbcD2f069CaB0446E1Ef472bd0b45B
// 0xA55DEF31daB76Eb80bcAE43E7ee43c1E525E4FBc
// 0x39E23F5b23e91F31973F189d08eFF82A9A8527F3
// 0xE03c9bF05fbBd3b2F6E029373FB3B2d448Cf5cc4
// 0x59Eb70FE5673E6ccD8Fe64B8632BD5213b352E64
// 0x6Ff166B5b6353A550F21B2459E5DE123305d970F
// 0x44D3a8A4c975Ea6d2D302D6fD1Fe01Df96494282
