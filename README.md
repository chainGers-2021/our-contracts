# What is working?
 - `truffle test`

# What is not working?
 - `yarn ganache`
 - `truffle test --network fork`: In another terminal

# Error occuring in `truffle test --network fork`
```
pam@g3:~/a/our-contracts$ truffle test --network fork

Compiling your contracts...
===========================
> Compiling ./contracts/Factory/PrivatePools.sol
> Compiling ./contracts/Factory/PublicPools.sol
> Compiling ./contracts/Interfaces/IPools.sol
> Compiling ./contracts/Libraries/Datatypes.sol
> Compiling ./contracts/Migrations.sol
> Compiling ./contracts/Pools/Comptroller.sol
> Compiling ./contracts/Pools/DonationPools.sol
> Compiling ./contracts/Utils/JustForCompile.sol
> Compiling ./contracts/Utils/Verification.sol
> Compiling ./contracts/chainlink/RandomNumberConsumer.sol
> Compiling @aave/protocol-v2/contracts/interfaces/ILendingPool.sol
> Compiling @aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol
> Compiling @aave/protocol-v2/contracts/interfaces/IScaledBalanceToken.sol
> Compiling @aave/protocol-v2/contracts/protocol/libraries/types/DataTypes.sol
> Compiling @chainlink/contracts/src/v0.6/VRFConsumerBase.sol
> Compiling @chainlink/contracts/src/v0.6/VRFRequestIDBase.sol
> Compiling @chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol
> Compiling @chainlink/contracts/src/v0.6/interfaces/LinkTokenInterface.sol
> Compiling @chainlink/contracts/src/v0.6/vendor/SafeMathChainlink.sol
> Compiling @openzeppelin/contracts/access/Ownable.sol
> Compiling @openzeppelin/contracts/cryptography/ECDSA.sol
> Compiling @openzeppelin/contracts/introspection/ERC165.sol
> Compiling @openzeppelin/contracts/introspection/IERC165.sol
> Compiling @openzeppelin/contracts/math/SafeMath.sol
> Compiling @openzeppelin/contracts/token/ERC1155/ERC1155.sol
> Compiling @openzeppelin/contracts/token/ERC1155/ERC1155Holder.sol
> Compiling @openzeppelin/contracts/token/ERC1155/ERC1155Receiver.sol
> Compiling @openzeppelin/contracts/token/ERC1155/IERC1155.sol
> Compiling @openzeppelin/contracts/token/ERC1155/IERC1155MetadataURI.sol
> Compiling @openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol
> Compiling @openzeppelin/contracts/token/ERC20/ERC20.sol
> Compiling @openzeppelin/contracts/token/ERC20/IERC20.sol
> Compiling @openzeppelin/contracts/utils/Address.sol
> Compiling @openzeppelin/contracts/utils/Context.sol
> Compiling erc1155-nft-token-and-holder/contracts/Token.sol
> Compiling erc1155-nft-token-and-holder/contracts/TokenHolder.sol
> Compilation warnings encountered:

    /home/pam/a/our-contracts/contracts/Factory/PublicPools.sol:72:35: Warning: Unused local variable.
        (, , , address priceFeed, uint8 decimals) =
                                  ^------------^
,/home/pam/a/our-contracts/contracts/Factory/PrivatePools.sol:75:35: Warning: Unused local variable.
        (, , , address priceFeed, uint8 decimals) = Comptroller(comptrollerContract).tokenData(_symbol);
                                  ^------------^

> Artifacts written to /tmp/test--125309-ejZrhaBXxGNH
> Compiled successfully using:
   - solc: 0.6.12+commit.27d51765.Emscripten.clang

--End of PublicPools Testing


  Contract: --PublicPools testing--
ETH balance:  3528387119413667064
0x5E6CaDdFbbf236520eF1bf17F333A45E7B7F9aF2
0x495487566faBE1e89206A2Ff41f49E483500F47E
0x596a987bA67222E94cD9acEdE88975380242a838
0xA72E521aE84620BD0DdD2b0c2d1279F97FD62CEF
Test1
    ✓ Cannot create Pool with no name (342ms)
Test2
    ✓ Only owner can create the Pool (407ms)
Test3
    1) Cannot create Pool with no token symbol
    > No events were emitted
Test4
    2) Cannot create Pool with same name
    > No events were emitted
Test5
    3) Cannot create Pool with same name but different token symbol
    > No events were emitted


  2 passing (15s)
  3 failing

  1) Contract: --PublicPools testing--
       Cannot create Pool with no token symbol:
     AssertionError: Did not fail
      at fails (node_modules/truffle-assertions/index.js:161:9)

  2) Contract: --PublicPools testing--
       Cannot create Pool with same name:
     AssertionError: Did not fail
      at fails (node_modules/truffle-assertions/index.js:161:9)

  3) Contract: --PublicPools testing--
       Cannot create Pool with same name but different token symbol:
     AssertionError: Did not fail
      at fails (node_modules/truffle-assertions/index.js:161:9)
```