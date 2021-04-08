# How to reproduce?
 - `yarn ganache`
 - `truffle test`

# Output of `truffle test`
```
pam@g3:~/a/our-contracts$ truffle test

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

> Artifacts written to /tmp/test--114242-FWapKoq2AjPM
> Compiled successfully using:
   - solc: 0.6.12+commit.27d51765.Emscripten.clang

--End of PublicPools Testing


  Contract: --PublicPools testing--
ETH balance:  100000000000000000000
0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0
0xF12b5dd4EAD5F743C6BaA640B0216200e89B60Da
0x345cA3e014Aaf5dcA488057592ee47305D9B3e10
0xf25186B5081Ff5cE73482AD761DB0eB0d25abfBF
Test1
{ Error: Returned error: VM Exception while processing transaction: revert Pool name can't be empty ! -- Reason given: Pool name can't be empty !.
    at Context.it (/home/pam/a/our-contracts/test/1_test_basic.js:51:17)
    at callFn (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:358:21)
    at Test.Runnable.run (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:346:5)
    at Runner.runTest (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:621:10)
    at /usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:745:12
    at next (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:538:14)
    at /usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:548:7
    at next (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:430:14)
    at cbHookRun (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:495:7)
    at done (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:302:5)
    at /usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:363:11
    at process._tickCallback (internal/process/next_tick.js:68:7)
  reason: 'Pool name can\'t be empty !',
  hijackedStack:
   'Error: Returned error: VM Exception while processing transaction: revert Pool name can\'t be empty ! -- Reason given: Pool name can\'t be empty !.\n    at Object.ErrorResponse (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/web3-core-helpers/src/errors.js:29:1)\n    at /usr/local/lib/node_modules/truffle/build/webpack:/node_modules/web3/node_modules/web3-core-requestmanager/src/index.js:170:1\n    at /usr/local/lib/node_modules/truffle/build/webpack:/packages/provider/wrapper.js:107:1\n    at XMLHttpRequest.request.onreadystatechange (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/web3/node_modules/web3-providers-http/src/index.js:111:1)\n    at XMLHttpRequestEventTarget.dispatchEvent (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request-event-target.js:34:1)\n    at XMLHttpRequest.exports.modules.996763.XMLHttpRequest._setReadyState (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request.js:208:1)\n    at XMLHttpRequest.exports.modules.996763.XMLHttpRequest._onHttpResponseEnd (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request.js:318:1)\n    at IncomingMessage.<anonymous> (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request.js:289:47)\n    at IncomingMessage.emit (events.js:203:15)\n    at endReadableNT (_stream_readable.js:1145:12)\n    at process._tickCallback (internal/process/next_tick.js:63:19)' }
    ✓ Cannot create Pool with no name (504ms)
Test2
{ Error: Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.
    at Context.it (/home/pam/a/our-contracts/test/1_test_basic.js:62:17)
    at callFn (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:358:21)
    at Test.Runnable.run (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:346:5)
    at Runner.runTest (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:621:10)
    at /usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:745:12
    at next (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:538:14)
    at /usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:548:7
    at next (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:430:14)
    at cbHookRun (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:495:7)
    at done (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:302:5)
    at /usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:363:11
    at process._tickCallback (internal/process/next_tick.js:68:7)
  reason: 'Ownable: caller is not the owner',
  hijackedStack:
   'Error: Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.\n    at Object.ErrorResponse (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/web3-core-helpers/src/errors.js:29:1)\n    at /usr/local/lib/node_modules/truffle/build/webpack:/node_modules/web3/node_modules/web3-core-requestmanager/src/index.js:170:1\n    at /usr/local/lib/node_modules/truffle/build/webpack:/packages/provider/wrapper.js:107:1\n    at XMLHttpRequest.request.onreadystatechange (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/web3/node_modules/web3-providers-http/src/index.js:111:1)\n    at XMLHttpRequestEventTarget.dispatchEvent (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request-event-target.js:34:1)\n    at XMLHttpRequest.exports.modules.996763.XMLHttpRequest._setReadyState (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request.js:208:1)\n    at XMLHttpRequest.exports.modules.996763.XMLHttpRequest._onHttpResponseEnd (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request.js:318:1)\n    at IncomingMessage.<anonymous> (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request.js:289:47)\n    at IncomingMessage.emit (events.js:203:15)\n    at endReadableNT (_stream_readable.js:1145:12)\n    at process._tickCallback (internal/process/next_tick.js:63:19)' }
    ✓ Only owner can create the Pool (53ms)
Test3
    ✓ Cannot create Pool with no token symbol
Test4
Error: Returned error: VM Exception while processing transaction: revert Token symbol can't be empty ! -- Reason given: Token symbol can't be empty !.
Error: Returned error: VM Exception while processing transaction: revert Token symbol can't be empty ! -- Reason given: Token symbol can't be empty !.
    1) Cannot create Pool with same name
{ Error: Returned error: VM Exception while processing transaction: revert Pool name already taken ! -- Reason given: Pool name already taken !.
    at Context.it (/home/pam/a/our-contracts/test/1_test_basic.js:84:17)
    at callFn (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:358:21)
    at Test.Runnable.run (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:346:5)
    at Runner.runTest (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:621:10)
    at /usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:745:12
    at next (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:538:14)
    at /usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:548:7
    at next (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:430:14)
    at cbHookRun (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:495:7)
    at done (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:302:5)
    at /usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:363:11
    at process._tickCallback (internal/process/next_tick.js:68:7)
  reason: 'Pool name already taken !',
  hijackedStack:
   'Error: Returned error: VM Exception while processing transaction: revert Pool name already taken ! -- Reason given: Pool name already taken !.\n    at Object.ErrorResponse (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/web3-core-helpers/src/errors.js:29:1)\n    at /usr/local/lib/node_modules/truffle/build/webpack:/node_modules/web3/node_modules/web3-core-requestmanager/src/index.js:170:1\n    at /usr/local/lib/node_modules/truffle/build/webpack:/packages/provider/wrapper.js:107:1\n    at XMLHttpRequest.request.onreadystatechange (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/web3/node_modules/web3-providers-http/src/index.js:111:1)\n    at XMLHttpRequestEventTarget.dispatchEvent (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request-event-target.js:34:1)\n    at XMLHttpRequest.exports.modules.996763.XMLHttpRequest._setReadyState (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request.js:208:1)\n    at XMLHttpRequest.exports.modules.996763.XMLHttpRequest._onHttpResponseEnd (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request.js:318:1)\n    at IncomingMessage.<anonymous> (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request.js:289:47)\n    at IncomingMessage.emit (events.js:203:15)\n    at endReadableNT (_stream_readable.js:1145:12)\n    at process._tickCallback (internal/process/next_tick.js:63:19)' }
    2) Cannot create Pool with same name
    > No events were emitted
Test5
{ Error: Returned error: VM Exception while processing transaction: revert Token/pricefeed doesn't exist -- Reason given: Token/pricefeed doesn't exist.
    at Context.it (/home/pam/a/our-contracts/test/1_test_basic.js:95:17)
    at callFn (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:358:21)
    at Test.Runnable.run (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:346:5)
    at Runner.runTest (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:621:10)
    at /usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:745:12
    at next (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:538:14)
    at /usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:548:7
    at next (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:430:14)
    at cbHookRun (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runner.js:495:7)
    at done (/usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:302:5)
    at /usr/local/lib/node_modules/truffle/node_modules/mocha/lib/runnable.js:363:11
    at process._tickCallback (internal/process/next_tick.js:68:7)
  reason: 'Token/pricefeed doesn\'t exist',
  hijackedStack:
   'Error: Returned error: VM Exception while processing transaction: revert Token/pricefeed doesn\'t exist -- Reason given: Token/pricefeed doesn\'t exist.\n    at Object.ErrorResponse (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/web3-core-helpers/src/errors.js:29:1)\n    at /usr/local/lib/node_modules/truffle/build/webpack:/node_modules/web3/node_modules/web3-core-requestmanager/src/index.js:170:1\n    at /usr/local/lib/node_modules/truffle/build/webpack:/packages/provider/wrapper.js:107:1\n    at XMLHttpRequest.request.onreadystatechange (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/web3/node_modules/web3-providers-http/src/index.js:111:1)\n    at XMLHttpRequestEventTarget.dispatchEvent (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request-event-target.js:34:1)\n    at XMLHttpRequest.exports.modules.996763.XMLHttpRequest._setReadyState (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request.js:208:1)\n    at XMLHttpRequest.exports.modules.996763.XMLHttpRequest._onHttpResponseEnd (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request.js:318:1)\n    at IncomingMessage.<anonymous> (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/xhr2-cookies/dist/xml-http-request.js:289:47)\n    at IncomingMessage.emit (events.js:203:15)\n    at endReadableNT (_stream_readable.js:1145:12)\n    at process._tickCallback (internal/process/next_tick.js:63:19)' }
    ✓ Cannot create Pool with same name but different token symbol (83ms)


  4 passing (2s)
  2 failing

  1) Contract: --PublicPools testing--
       Cannot create Pool with same name:
     Uncaught RuntimeError: abort(Error: Returned error: VM Exception while processing transaction: revert Token symbol can't be empty ! -- Reason given: Token symbol can't be empty !.). Build with -s ASSERTIONS=1 for more info.
      at process.abort (/home/pam/.config/truffle/compilers/node_modules/soljson-v0.6.12+commit.27d51765.js:1:13938)
      at process.emit (/usr/local/lib/node_modules/truffle/build/webpack:/node_modules/source-map-support/source-map-support.js:495:1)
      at emitPromiseRejectionWarnings (internal/process/promises.js:140:18)
      at process._tickCallback (internal/process/next_tick.js:69:34)

  2) Contract: --PublicPools testing--
       Cannot create Pool with same name:
     Error: done() called multiple times in test <Contract: --PublicPools testing-- Cannot create Pool with same name> of file /home/pam/a/our-contracts/test/1_test_basic.js
      at process._tickCallback (internal/process/next_tick.js:68:7)
```