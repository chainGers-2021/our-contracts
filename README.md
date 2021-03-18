# our-contracts
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


## How to run?
 - `hh compile`
 - `hh test`
 - `hh test --network kovan`
 - `hh test --network hardhat`

## Description
 - Deposit process(test)
   - deposit erc20 to Comptroller

 - Validate user
 - Deposit ERC20 to Comptroller
 - Comptroller `deposit()` to `AAVE Lending Pool`
 - Amount quote is given to private pools


Pool890(_privateKey)


(100, 0)

(100%5 = 0)

100 <= contract


0 <= user