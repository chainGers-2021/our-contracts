// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ECDSA} from "@openzeppelin/contracts/cryptography/ECDSA.sol";
import { ILendingPool, ILendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import "@aave/protocol-v2/contracts/interfaces/IScaledBalanceToken.sol";
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

/***
 * Factory Contract for creating private pools
 * @author Chinmay Vemuri
 * Optimizations to be done:
 * 1) Store index instead of the address of the token in a pool
 */

struct Pool {
    string poolName;
    string symbol;
    address owner;
    address accountAddress;
    uint256 targetPrice;
    bool active;
    mapping(address => bool) verified;
    mapping(bytes => bool) signatures;
    mapping(address => uint256) userDeposits;
}

struct TokenData {
    string symbol;
    address token;
    address aToken;
    address priceFeed;
    uint8 decimals;
}

contract PrivatePools is Ownable {
    using ECDSA for bytes32;
    using SafeMath for uint256;
    using SafeMath for int256;

    address lendingPoolAddressProvider = 0x88757f2f99175387aB4C6a4b3067c77A695b0349;
    mapping(string => TokenData) public tokenData;
    mapping(string => Pool) public poolNames;

    event newTokenAdded(string _symbol, address _token, address _aToken);
    event verified(string indexed _poolName, address _sender);
    event newDeposit(string indexed _poolName, address _sender, uint256 _amount);
    event totalDeposit(string indexed _poolNames, address _sender, uint256 _amount);
    event newPoolCreated(
        string indexed _poolName,
        address indexed _owner,
        string symbol,
        uint256 _targetPrice
    );



    modifier onlyVerified(string calldata _poolName) 
    {
        require(
            poolNames[_poolName].verified[msg.sender],
            "Sender not verified !"
        );
        _;
    }

    modifier checkAccess(string calldata _poolName)
    {
        require(
            poolNames[_poolName].verified[msg.sender],
            "Sender not verified !"
        );
        require(
            poolNames[_poolName].active, 
            "Pool not active !"
        );
        _;
    }

    modifier changeActive(string calldata _poolName)
    {
        Pool storage pool = poolNames[_poolName];
        TokenData storage token = tokenData[pool.symbol];

        if(pool.targetPrice <= uint256(priceFeedData(token.priceFeed)).div(10**uint256(token.decimals)))
            pool.active = false;
        _;
    }



    function priceFeedData(address _aggregatorAddress) internal view returns (int256)
    {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = AggregatorV3Interface(_aggregatorAddress).latestRoundData();

        return price;
    }

    function addTokenData(
        string calldata _symbol,
        address _token, 
        address _aToken, 
        address _priceFeed,
        uint8 _decimals
    ) external onlyOwner
    {
        require(bytes(tokenData[_symbol].symbol).length == 0, "Token data already present !");
        TokenData memory newTokenData;
        
        newTokenData.symbol = _symbol;
        newTokenData.token = _token;
        newTokenData.aToken = _aToken;
        newTokenData.priceFeed = _priceFeed;
        newTokenData.decimals = _decimals;
        tokenData[_symbol] = newTokenData;

        emit newTokenAdded(_symbol, _token, _aToken);
    }

    function createPool(
        string calldata _symbol,
        string calldata _poolName,
        uint256 _targetPrice,
        address _accountAddress
    ) external 
    {
        TokenData storage poolToken = tokenData[_symbol];

        require(
            bytes(tokenData[_symbol].symbol).length != 0,
            "Invalid token address !"
        );
        require(
            bytes(poolNames[_poolName].poolName).length == 0,
            "Pool name already taken !"
        );
        /// @dev While calculating, take care of cases where price < $1.
        require(
            _targetPrice > uint256(priceFeedData(poolToken.priceFeed)).div(10**uint256(poolToken.decimals)),
            "Target price is lesser than current price"
        );

        Pool storage newPool = poolNames[_poolName];

        newPool.poolName = _poolName;
        newPool.owner = msg.sender;
        newPool.symbol = _symbol;
        newPool.accountAddress = _accountAddress;
        newPool.targetPrice = _targetPrice;
        newPool.active = true;
        newPool.verified[msg.sender] = true;

        emit newPoolCreated(_poolName, msg.sender, _symbol, _targetPrice);
    }

    function verifyPoolAccess(
        string calldata _poolName,
        bytes32 _messageHash,
        bytes calldata _signature
    ) external 
    {
        Pool storage pool = poolNames[_poolName];
        require(
            _messageHash.recover(_signature) ==
                poolNames[_poolName].accountAddress,
            "Verification failed"
        );
        require(
            !pool.signatures[_signature],
            "Unauthorized access: Reusing signature"
        );

        pool.verified[msg.sender] = true;
        pool.signatures[_signature] = true;
    }

    function depositERC20(
        string calldata _poolName, 
        uint256 _amount
    ) external changeActive(_poolName) checkAccess(_poolName)
    {
        Pool storage pool = poolNames[_poolName];
        TokenData storage poolTokenData = tokenData[pool.symbol];

        require(
            pool.verified[msg.sender], 
            "Sender not verified !"
        );

        IERC20 token = IERC20(poolTokenData.token);

        // Checking if user has allowed this contract to spend
        require(
            _amount <= token.allowance(msg.sender, address(this)),
            "Amount exceeds allowance limit !"
        );

        // Transfering tokens into this contract
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Unable to transfer tokens to contract !"
        );

        address lendingPool = ILendingPoolAddressesProvider(lendingPoolAddressProvider).getLendingPool();

        // Transfering into Lending Pool
        require(token.approve(lendingPool, _amount), "Approval failed !");

        ILendingPool(lendingPool).deposit(
            poolTokenData.token,
            _amount,
            address(this),
            0
        );

        uint128 liquidityIndex = ILendingPool(lendingPool).getReserveData(poolTokenData.token).liquidityIndex;
        pool.userDeposits[msg.sender] += (_amount.mul(10**27)).div(liquidityIndex);

        emit newDeposit(_poolName, msg.sender, _amount);
        emit totalDeposit(_poolName, msg.sender, pool.userDeposits[msg.sender]);
    }


    // Functions for testing
    function getVerifiedStatus(string calldata _poolName) external view returns (bool)
    {
        Pool storage pool = poolNames[_poolName];
        return pool.verified[msg.sender];
    }

    function verifyPool(string calldata _poolName) external view returns (bool)
    {
        Pool memory pool = poolNames[_poolName];
        if (keccak256(abi.encode(pool.poolName)) == keccak256(abi.encode(_poolName))) 
            return true;
        else 
            return false;
    }

    function getUserDeposit(string calldata _poolName)
        external
        view
        returns (uint256)
    {
        Pool storage pool = poolNames[_poolName];
        return pool.userDeposits[msg.sender];
    }

    
}
