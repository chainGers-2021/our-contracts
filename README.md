<img width="1000" src="./images/HodlTogether-Logo-final.png">

## _The Coolest Defi+NFT Hodling Pool_

<p align = center>
[![N|Solid](https://storageapi.fleek.co/chaingers2021-team-bucket/badges/built-with.png)](https://aave.com/)

[![N|Solid](https://storageapi.fleek.co/chaingers2021-team-bucket/badges/aave-final-trans.png)](https://aave.com/) [![N|Solid](https://storageapi.fleek.co/chaingers2021-team-bucket/badges/chainlink-final-trans.png)](https://chain.link/) 

</p>

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger) [![Website https://hodltogether.on.fleek.co/](https://img.shields.io/website-up-down-green-red/http/monip.org.svg)](https://hodltogether.on.fleek.co/) [![PyPI license](https://img.shields.io/pypi/l/ansicolortags.svg)](https://pypi.python.org/pypi/ansicolortags/)

# Introduction
We introduce you to the __coolest community hodling pool__ on Ethereum- HodlTogether, which is a spicy amalgamation of the __Defi__, __NFTs__ and __NGOs__. HodlTogether uniquely incentivizes the users to Hodl their tokens which can be of any type such as LINK, ZRX, BAT, SRX, etc. for a long period of time. By doing so, they also contribute to the betterment of society and community development, as they donate a certain amount of their Hodled tokens to the NGO associated with the Hodling pool.
## How does the tokenomics work?
Hodltogether consists of _**two types**_ of pools- __Public pool__ and __Private pool__. Users can freely choose to deposit or Hodl their tokens in any of these two types. Each type of token has a unique Public pool which can be joined by any user. If a user decides to deposit his tokens in a Public pool, his tokens are locked into the contract and are automatically deposited into __*Aave lending pools*__, thus generating atoken rewards for him. During this deposit, each user is charged a __minimal amount__ of fee equivalent to __1%__ of the total amount. This fee amount is distributed equally amongst the NGOs that are associated with the pool when the pool breaks. The user can withdraw his tokens from these pools anytime, but he will need to pay __4%__ withdrawal fee that will be be __distributed equally__ amongst the remaining hodlers in the pool. The user can *avoid* this withdrawal fee entirely if he chooses to hodl his tokens in the pool until the pool breaks automatically. Thus, the users are incentivized to deposit and hodl their tokens together.

A __*Unique thing*__ about HodlTogether's Public pools is that it also awards __NFTs__ to the __top 5__ Hodlers of each __Public pool__. These NFTs are of __ERC-1155__ standard and are different for each type of token.

The Private pools are the pools that can be made by any user for a specific type of token. Unlike public pools, these private pools need the permission of the pool admin i.e. the pool creator to join. The pool admin gets a new private key which he can share with the other participants and invite them to join the pool. So, the private pools gives the users the ability to create a personal pool which they can share only with the people whom they want to invite. But unlike public pools, the private pools do not have the ERC-1155 token rewards for the top hodlers of the pool.  

## When does the pool break?
The public pools break i.e. get closed when the token in the pool reaches its all time high or when it reaches its week's highest price. In case of private pools, the creator of the pool himself sets the price point of when the pool should break. So he needs to be careful in choosing the right price when he thinks the pool should break as setting this value too high can result in the  pools never breaking. The token rewards are freely distributed amongst the participants only after the pools break



## How to run?
 - `yarn`: Installation
 - `yarn compile`: Compilation
 - `yarn test`: Testing on local dev(as specified in `development` network in `truffle.config.js`)
 - `yarn test:revert`: **Testing on truffle**
 - `yarn test:fork`: **Testing on forked blockchain**

## **Migrating on kovan/fork**
 - `truffle migrate --network [fork/kovan]`
 - `truffle exec scripts/3_pool_creation.js --network [fork/kovan]`

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

Note: All the above said tests are to be done using PublicPools in mind. Now below instructions will tell you how 
to do the same tests for the PrivatePools.

# Create a PrivatePool
  - `Create a PrivatePool, this can be done by anyone but for testing purpose use admin account`
  - `Create an account using web3 (create method). This will return an account object containing the address and private key`
  - `Let 5 users join this pool using the private key. To do this, you have to sign a random hex string (can be generated using web3) and call the verification function in the PrivatePools contract.`
  - `Do the above given tests`

# Kovan deployment
Verifying Comptroller
Pass - Verified: https://kovan.etherscan.io/address/0xf2Ad9aBa18d5Ab625023Cd78a2D84c7aF8A0e63d#contracts
Verifying PrivatePools
Pass - Verified: https://kovan.etherscan.io/address/0x15400da9b82f865A1Bf8D253AA8128ffbAec5d43#contracts
Verifying PublicPools
Pass - Verified: https://kovan.etherscan.io/address/0x669665F1182A57A4182e1B63bb12E530E1388f01#contracts
Verifying DonationPools
Pass - Verified: https://kovan.etherscan.io/address/0x41ce3B221939a0a9D09B766Fb8ea72e2dd0B3Ed0#contracts
# Kovan Deployment Test

Starting migrations...
======================
> Network name:    'kovan'
> Network id:      42
> Block gas limit: 12500000 (0xbebc20)


1_initial_migrations.js
=======================

   Replacing 'Migrations'
   ----------------------
   > transaction hash:    0xb174fa4034f730e1e9e5242f710d3b111d420ee42734e13e3fed15670d5b2280
   > Blocks: 0            Seconds: 5
   > contract address:    0x07ed6Dd2baB815CBbaAe29F123De9DB768A29835
   > block number:        24212881
   > block timestamp:     1618053716
   > account:             0x5A0e9605a31696b24Dc12e19D3D16694Cc39D195
   > balance:             7.517332654413667064
   > gas used:            186963 (0x2da53)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.00373926 ETH


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.00373926 ETH


2_contracts.js
==============

   Replacing 'ScaledMath'
   ----------------------
   > transaction hash:    0xc81409f001d6d23d728aacefc9355efc367cc17df07c3856154aacd41b660c1a
   > Blocks: 2            Seconds: 13
   > contract address:    0xbFcEB0EfA6ee28A257fF828D992F855755A778db
   > block number:        24212885
   > block timestamp:     1618053748
   > account:             0x5A0e9605a31696b24Dc12e19D3D16694Cc39D195
   > balance:             7.512425394413667064
   > gas used:            203028 (0x31914)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.00406056 ETH


   Linking
   -------
   * Contract: Comptroller <--> Library: ScaledMath (at address: 0xbFcEB0EfA6ee28A257fF828D992F855755A778db)

   Linking
   -------
   * Contract: PrivatePools <--> Library: ScaledMath (at address: 0xbFcEB0EfA6ee28A257fF828D992F855755A778db)

   Linking
   -------
   * Contract: PublicPools <--> Library: ScaledMath (at address: 0xbFcEB0EfA6ee28A257fF828D992F855755A778db)

   Replacing 'Comptroller'
   -----------------------
   > transaction hash:    0x15c39cb46b5e8eaad1966e97cf7d0bdbecb491d0fe2f3c1487ff3590ba6b084d
   > Blocks: 1            Seconds: 9
   > contract address:    0xf2Ad9aBa18d5Ab625023Cd78a2D84c7aF8A0e63d
   > block number:        24212887
   > block timestamp:     1618053764
   > account:             0x5A0e9605a31696b24Dc12e19D3D16694Cc39D195
   > balance:             7.445181654413667064
   > gas used:            3362187 (0x334d8b)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.06724374 ETH


   Replacing 'PrivatePools'
   ------------------------
   > transaction hash:    0xa0fec10428da69196db175dd8f2feca2245e8aabed42d6c8ed06ed9bb87f14ec
   > Blocks: 1            Seconds: 9
   > contract address:    0x15400da9b82f865A1Bf8D253AA8128ffbAec5d43
   > block number:        24212889
   > block timestamp:     1618053780
   > account:             0x5A0e9605a31696b24Dc12e19D3D16694Cc39D195
   > balance:             7.378039914413667064
   > gas used:            3357087 (0x33399f)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.06714174 ETH


   Replacing 'PublicPools'
   -----------------------
   > transaction hash:    0x49e1f3b9b49d13d6a5fc79ecbd2e17df171995e04b826ee7728bf0e07cab0bc2
   > Blocks: 1            Seconds: 9
   > contract address:    0x669665F1182A57A4182e1B63bb12E530E1388f01
   > block number:        24212891
   > block timestamp:     1618053796
   > account:             0x5A0e9605a31696b24Dc12e19D3D16694Cc39D195
   > balance:             7.324887754413667064
   > gas used:            2657608 (0x288d48)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.05315216 ETH


   Replacing 'DonationPools'
   -------------------------
   > transaction hash:    0xfe8ed9ae55e02aecf55f5e35c063b23d8bf4eb38c8accc706c56aefcc6abab69
   > Blocks: 1            Seconds: 9
   > contract address:    0x41ce3B221939a0a9D09B766Fb8ea72e2dd0B3Ed0
   > block number:        24212893
   > block timestamp:     1618053812
   > account:             0x5A0e9605a31696b24Dc12e19D3D16694Cc39D195
   > balance:             7.293740054413667064
   > gas used:            1557385 (0x17c389)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.0311477 ETH


--Setting pool addresses in comptroller--


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:           0.2227459 ETH


3_pool_creation.js
==================

--Starting up the migrations--

Admin ETH balance:  7291472194413667064
Admin LINK balance:  660874001018385100000
Admin BAT balance:  1e+23
Admin ZRX balance:  1e+23
Admin SNX balance:  100000000000000000000

--Transferring necessary ether amount--


Successfull!


--Transferring necessary tokens--


Successfull!


--Transferring necessary tokens--


Successfull!


--Transferring necessary tokens--


Successfull!


--Transferring necessary tokens--


Successfull!

New token  LINK  added.
New token  BAT  added.
New token  ZRX  added.
New token  SNX  added.
New recipient  DEV  added.

New public pool name:   LPUBLIC 
Pool symbol:  LINK 
Owner:  0x5A0e9605a31696b24Dc12e19D3D16694Cc39D195 
Target price:  35

New public pool name:   BPUBLIC 
Pool symbol:  BAT 
Owner:  0x5A0e9605a31696b24Dc12e19D3D16694Cc39D195 
Target price:  2

New public pool name:   SPUBLIC 
Pool symbol:  SNX 
Owner:  0x5A0e9605a31696b24Dc12e19D3D16694Cc39D195 
Target price:  25

New private pool name:  LPRIVATE 
Private key:  0x245a68da58c4bd3e3510aea2766a3a07dc596a2a7605fb905002b8926c857315 
Pool Symbol:  LINK 
Owner:  0xFe8364114DBDf7e8Fd05F25D1F036939f38fA26d 
Target price:  35

New private pool name:  ZPRIVATE 
Private key:  0x3e4230906326f2319b53c104740fc68724dee052573a773db2629b81de12e2b6 
Pool Symbol:  ZRX 
Owner:  0x6EC9Ba821ef967c710b398c90E82fb1cce1A91Be 
Target price:  3

Populating public pools


--Depositing tokens in a pool--

LINK  balance of  1  :  58990000001405485000
LINK  balance of  2  :  63990000001218080000
LINK  balance of  3  :  65656666667791050000
LINK  balance of  4  :  66490000000843284000

Successfull!

Pool scaled balance:  20818570622673820000

--Depositing tokens in a pool--

BAT  balance of  1  :  0
BAT  balance of  2  :  50000000000000000000
BAT  balance of  3  :  66666666666666660000
BAT  balance of  4  :  75000000000000000000

Successfull!

Pool scaled balance:  199913742553961000000

--Depositing tokens in a pool--

SNX  balance of  1  :  0
SNX  balance of  2  :  500000000000000000
SNX  balance of  3  :  666666666666666800
SNX  balance of  4  :  750000000000000000

Successfull!

Pool scaled balance:  2068297116612116200

Populating private pools


--Depositing tokens in a pool--

LINK  balance of  1  :  48990000001405485000
LINK  balance of  2  :  58990000001218080000
LINK  balance of  3  :  62323333334457710000
LINK  balance of  4  :  63990000000843284000

Successfull!

Pool scaled balance:  41637141186658120000

--Depositing tokens in a pool--

ZRX  balance of  1  :  0
ZRX  balance of  2  :  50000000000000000000
ZRX  balance of  3  :  66666666666666660000
ZRX  balance of  4  :  75000000000000000000

Successfull!

Pool scaled balance:  207751159262677370000

De-populating private pools except LINK pool


--Withdrawing tokens from a pool--

ZRX  balance of  1  :  94353264149273430000
ZRX  balance of  2  :  97104052639518750000
ZRX  balance of  3  :  98022779341301630000
ZRX  balance of  4  :  98460867010089500000

Successfull!

Pool scaled balance:  12025338692392395000

De-populating public pools


--Withdrawing tokens from a pool--

LINK  balance of  1  :  58405632117272520000
LINK  balance of  2  :  63690573264176914000
LINK  balance of  3  :  65452399659409480000
LINK  balance of  4  :  66331189729469070000

Successfull!

Pool scaled balance:  22064559025941560000

--Withdrawing tokens from a pool--

BAT  balance of  1  :  98053173193924950000
BAT  balance of  2  :  98951161057923300000
BAT  balance of  3  :  99252360160813170000
BAT  balance of  4  :  99380846536310620000

Successfull!

Pool scaled balance:  4187038256239570000

--Withdrawing tokens from a pool--

SNX  balance of  1  :  947736241581444100
SNX  balance of  2  :  973139092655711500
SNX  balance of  3  :  981624761799982300
SNX  balance of  4  :  985653891813595000

Successfull!

Pool scaled balance:  111038843888007940

--Pools simulation complete--


   > Saving migration to chain.
   -------------------------------------
   > Total cost:                   0 ETH


Summary
=======
> Total deployments:   6
> Final cost:          0.22648516 ETH
