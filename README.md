[![Website shields.io](https://img.shields.io/website-up-down-green-red/http/shields.io.svg)](http://shields.io/)
[![Ask Me Anything !](https://img.shields.io/badge/Ask%20me-anything-1abc9c.svg)](https://GitHub.com/Naereen/ama)
[![made-with-Markdown](https://img.shields.io/badge/Made%20with-Markdown-1f425f.svg)](http://commonmark.org)
[![made-for-VSCode](https://img.shields.io/badge/Made%20for-VSCode-1f425f.svg)](https://code.visualstudio.com/)
[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/Naereen/StrapDown.js/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Open Source Love png2](https://badges.frapsoft.com/os/v2/open-source.png?v=103)](https://github.com/ellerbrock/open-source-badges/)

[![ForTheBadge built-with-swag](http://ForTheBadge.com/images/badges/built-with-swag.svg)](https://GitHub.com/Naereen/)
[![ForTheBadge uses-git](http://ForTheBadge.com/images/badges/uses-git.svg)](https://GitHub.com/)
[![ForTheBadge uses-js](http://ForTheBadge.com/images/badges/uses-js.svg)](http://ForTheBadge.com)
[![ForTheBadge powered-by-electricity](http://ForTheBadge.com/images/badges/powered-by-electricity.svg)](http://ForTheBadge.com)

<center>
<h1 align="center">
Welcome to the COOLEST Defi+NFT Hodling Pool!
</h1>

<img width="1000" src="./images/HodlTogether-Logo-final.png">

<p align = center>
<img src= "./images/built-with.png">
<br>
<img src="./images/aave-final-trans.png">
<img src="./images/chainlink-final-trans.png">
</p>
</center>

## Introduction

We introduce you to the **coolest community hodling pool** on _Ethereum- HodlTogether_, which is a _spicy amalgamation_ of the **Defi**, **NFTs** and **NGOs**. HodlTogether uniquely incentivizes the users to _Hodl_ their tokens which can be of any type such as _LINK_, _ZRX_, _BAT_, _SRX_, etc. for a long period of time. By doing so, they also contribute to the betterment of society and community development, as they donate a certain amount of their _Hodled tokens_ to the **NGO** associated with the _Hodling pool_.

## Aim of the Project

- The ongoing pandemic has certainly tested our resolve but it has also presented to us the world of cryptocurrencies. Number of people holding cryptocurrencies and digital assets has risen exponentially and the crypto community has benefitted from this rise as more of them want to explore the possibilities in this space.

- Many _amateur traders_ who just started exploring this space buy tokens and sell it as soon as there is a small rise in the prices as there always remains this fear that the market may crash anytime (emotional trading). Due to this, they lose the opportunity to truly gain from holding their tokens long term. Also, the tokens sit idle in their wallets which can actually be put to better use when invested in different protocols and projects.

- Our platform allows creation of pools by _anyone_ wherein they can hold their tokens until a target price is reached (this is determined beforehand by the pool creator). Their idle assets collect interest using the Aave protocol. A _portion_ of their earnings is given to **NGOs** or charities vetted by the community or developers. The hodlers are **rewarded** with **exciting NFTs** created by these non-profit organisations.

## Incentivization Method

 - When a person joins a pool, they are expected to hold their tokens until the target price of the pool is achieved. If they wish to withdraw their tokens before the target price is achieved, they can do so but a percentage of their withdrawal amount is given to the pool members and the NGOs. Upon achieving the target price of the pool, there is no withdrawal fee and the amount returned includes the interest accrued in Aave protocol. The hodlers are also eligible to receive NFTs created by partner NGOs. Distribution of NFTs can be done on a lottery basis or by leaderboard rankings. This simple theory discourages emotional trading and makes hodling exciting and rewarding.

## Pools

Each pool consists of a token type and a target price. Ex: A pool for LINK token or a pool for BAT token. There are two types of a pool:

### **1. Public pools**
These types of pools are created by the developers and the target price is set ideally as the **all time high** value of the token that pool represents. If the mood around the token price is bearish then developers can choose to set the price lower than the ATH as necessary. There is no barrier to entry in these types of pools. A **Unique thing** about HodlTogether's Public pools is that it also awards **NFTs** to the _top 5 Hodlers_ of each Public pool. These NFTs are of **ERC-1155** standard and are different for each type of token.

### **2. Private pools**

 - These types of pools can be created by _anyone_ and the target price can be set as desired beforehand. These pools can be made for any type of token that the user desires. To participate/join in these pools, one needs to have a private key/invitation which is only known to the pool creator. This key isn’t stored anywhere and is shown only once after the creation of the pool. This private key is only required once for verification purposes but otherwise, deposition and withdrawal of tokens can be done without this key.

 - During deposition, each user is charged a minimal amount of fee equivalent to **1%** of the total deposition amount. This fee amount is distributed equally amongst the NGOs that are associated with the platform. A user can withdraw his/her tokens from these pools anytime, but he will need to pay a **5%** _withdrawal fee_ that will be distributed among the NGOs and the pool members. A user can avoid this withdrawal fee entirely if he/she chooses to hodl his/her tokens in the pool until the pool breaks (target price is achieved) automatically. Thus, the users are _incentivized_ to deposit and _hodl_ their tokens together.

 - So, the private pools gives the users the ability to create a personal pool which they can share only with the people whom they want to invite. But unlike public pools, the private pools do not have the ERC-1155 token rewards for the top hodlers of the pool.

## When does the pool break?

 - The public pools break i.e. get closed when the token in the pool reaches its all time high or when it reaches its week's highest price. In case of private pools, the creator of the pool himself sets the price point of when the pool should break. So he needs to be careful in choosing the right price when he thinks the pool should break as setting this value too high can result in the pools never breaking. The token rewards are freely distributed amongst the participants without any withdrawal fee only after the pools breaks.

## How to run?

- `yarn`: Installation
- `yarn compile`: Compilation
- `yarn test`: Testing on local dev(as specified in `development` network in `truffle.config.js`)
- `yarn test:revert`: **Testing on truffle**
- `yarn test:fork`: **Testing on forked blockchain**
- Currently tests can't be run on ganache fork due to [linking library error](https://ethereum.stackexchange.com/questions/97061/how-to-make-a-deployer-in-truffle-tests).

## **Migrating on kovan/fork**

- `truffle migrate --network [fork/kovan]`
- `truffle exec scripts/3_pool_creation.js --network [fork/kovan]`

### Extra note:

For manual testing on fork:

- `yarn ganache`: Starting the forked blockchain
- `yarn test in another terminal`: Testing on local dev(as specified in `development` network in `truffle.config.js`)

## Instructions for Testing

### Test for depositERC20 in comptroller

- `Create 10 users and deposit 1 link token by all of them`
- `Check the scaled balance of all the 10 users`

### Test for withdrawERC20 in comptroller

- `Let all the 10 users withdraw their tokens`
- `Check their scaled balances after withdrawing`
- `Check if the final returned amount is greater than initial deposit amount`

> Note: All the above said tests are to be done using PublicPools in mind. Now below instructions will tell you how to do the same tests for the PrivatePools.

### Create a PrivatePool

- `Create a PrivatePool, this can be done by anyone but for testing purpose use admin account`
- `Create an account using web3 (create method). This will return an account object containing the address and private key`
- `Let 5 users join this pool using the private key. To do this, you have to sign a random hex string (can be generated using web3) and call the verification function in the PrivatePools contract.`
- `Do the above given tests`

## Kovan deployment
### Comptroller
 - Pass - Verified: https://kovan.etherscan.io/address/0xf2Ad9aBa18d5Ab625023Cd78a2D84c7aF8A0e63d#contracts
### PrivatePools
 - Pass - Verified: https://kovan.etherscan.io/address/0x15400da9b82f865A1Bf8D253AA8128ffbAec5d43#contracts
### PublicPools
 - Pass - Verified: https://kovan.etherscan.io/address/0x669665F1182A57A4182e1B63bb12E530E1388f01#contracts
### DonationPools
 - Pass - Verified: https://kovan.etherscan.io/address/0x41ce3B221939a0a9D09B766Fb8ea72e2dd0B3Ed0#contracts

## Deployment logs

```
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
```

## Contributors
<table>
  <tr>
    <td align="center">
      <a href="https://github.com/rashtrakoff">
          <img src="https://avatars2.githubusercontent.com/u/55590938" width="100;" alt="anupam"/>
          <br />
          <sub><b>Chinmay Sai Vemuri</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/sksuryan">
          <img src="https://avatars.githubusercontent.com/u/42460131" width="100;" alt="anupam"/>
          <br />
          <sub><b>Saurabh Kumar Suryan</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/akcgjc007">
          <img src="https://avatars2.githubusercontent.com/u/56300182" width="100;" alt="anupam"/>
          <br />
          <sub><b>Anupam Kumar</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/shantanhunt">
          <img src="https://avatars.githubusercontent.com/u/63099646" width="100;" alt="anupam"/>
          <br />
          <sub><b>Shantanu Sontakke
</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/pran01">
          <img src="https://avatars.githubusercontent.com/u/55594298" width="100;" alt="anupam"/>
          <br />
          <sub><b>Pranav Sinha</b></sub>
      </a>
    </td>
  </tr>
</table>
