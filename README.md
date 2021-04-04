# our-contracts
## Deployment Details
 - `Network`: Kovan
 - `Address`: 0x53B9f3A0FF843Ef20ad81a334A0905221654a90F

## How to run?
## Installation
 - `yarn`
## Commands:
 - `yarn compile`
 - `yarn test`
 - `yarn test`
 - `yarn verify`

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

## Instructions for mainnet forking
 - `yarn ganache`
 - `yarn test` in another terminal