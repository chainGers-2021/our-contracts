# our-contracts

## How to run?
 - `yarn`: Installation
 - `yarn compile`: Compilation
 - `yarn test`: Testing on local dev(as specified in `development` network in `truffle.config.js`)
 - `yarn test:fork`: **Testing on forked blockchain**
 - `yarn migrate`: Migrating on `Kovan`

### Extra note:
For manual testing on fork:
 - `yarn ganache`: Starting the forked blockchain
 - `yarn test in another terminal`: Testing on local dev(as specified in `development` network in `truffle.config.js`)

## Description
 - Deposit process(test)
   - deposit erc20 to Comptroller

 - Validate user
 - Deposit ERC20 to Comptroller
 - Comptroller `deposit()` to `AAVE Lending Pool`
 - Amount quote is given to private pools

## Logs
UserA = 100, pool.deposit(_factoryAddress)
UserB = 100, pool.deposit(_factoryAddress)
UserC = 100, pool.deposit(_factoryAddress)

aToken.balanceOf(_factoryAddress) = 389

m[_user]

Interest = 89
(
    how to distribute to users(on the basis of what?):
    scaledBalance(m[_user])
)

(totalDeposited/currentBalance)

## Experiments:
```
rashtrakoff@chinmay-linux:/media/rashtrakoff/CHINMAYHDD/Blockchain_Projects/Chainlink Hackathon/our-contracts$ yarn 2
yarn run v1.22.5
$ hh task2 --network kovan
web3-shh package will be deprecated in version 1.3.5 and will no longer be supported.
web3-bzz package will be deprecated in version 1.3.5 and will no longer be supported.
Account address:  0x3D356DCBAc29e69a7fc237f45F8318E099268a0e
Ether balance:  1311056856522194786
liquidityIndex now: 1.0006897086865483
ERC20 balance:  3041127000239174122795
Approve1:  29056
Deposit1() gas used:  182996
Scaled balance1:  26051219820589467
liquidityIndex now: 1.0006897136324642
Approve2  29056
Deposit2() gas used:  182984
liquidityIndex now: 1.0006897139775282
Scaled balance2:  28049841343389403
aToken approve() gas used:  26844
Withdraw() gas used:  195513
Scaled balance after withdraw:  25051909060223264
ERC20 balance:  3041127000239174122795
liquidityIndex now: 1.0006897143225921
Done in 74.77s.
```

## Instructions for Testing
# Test for depositERC20 in comptroller
 - `Create 10 users and deposit 1 link token by all of them`
 - `Check the scaled balance of all the 10 users`

# Test for withdrawERC20 in comptroller
  - `Let all the 10 users withdraw their tokens`
  - `Check their scaled balances after withdrawing`
  - `Check if the final returned amount is greater than initial deposit amount`


# Kovan deployment
Comp: https://kovan.etherscan.io/address/0x8D9bc3b6Ee6b7BfeAA323c1d11715e852F7767d5
pvt: https://kovan.etherscan.io/address/0xe991d6184DC0195b45DFfe3dAAead91f399D5c9F
pub: https://kovan.etherscan.io/address/0xBF2214621AE6F123B801D22ba1C59bCA33bA299F
don: https://kovan.etherscan.io/address/0xC9420621CC14BdA1B5E502584f7302bd98ff0D62