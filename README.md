# our-contracts
## How to run?
## Installation
 - `yarn`
## Custom shorthands:
 - `yarn c`: compile
 - `yarn t`: test on default network
 - `yarn l`: test on local hardhat node
 - `yarn k`: test on kovan network
## hh shorthands:
 - `hh compile`: compile 
 - `hh test`: test on default network
 - `hh test --network kovan`
 - `hh test --network hardhat`

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