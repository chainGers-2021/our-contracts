// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ECDSA } from "@openzeppelin/contracts/cryptography/ECDSA.sol";
import { ILendingPool, ILendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import "@aave/protocol-v2/contracts/interfaces/IScaledBalanceToken.sol";
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import { Datatypes } from '../Utils/Datatypes.sol';

/***
 * Factory Contract for creating private pools
 * @author Chinmay Vemuri
 * Optimizations to be done:
 * 1) Store index instead of the address of the token in a pool
 * 2) Use try/catch for deposit and withdraw functions.
 */

contract PrivatePools is Ownable {
    using ECDSA for bytes32;
    using SafeMath for uint256;
    using Datatypes for *;


    address lendingPoolAddressProvider = 0x88757f2f99175387aB4C6a4b3067c77A695b0349;
    uint256 constant NGO_FEE_PER = 100; // Fee percentage (basis points) given to NGOs.
    uint256 constant REWARD_FEE_PER = 400; // Fee percentage (basis points) given to Pool members.
    mapping(string => Datatypes.TokenData) public tokenData;
    mapping(string => Datatypes.Pool) public poolNames;


    modifier checkAccess(string calldata _poolName)
    {
        Pool storage pool = poolNames[_poolName];
        TokenData storage token = tokenData[pool.symbol];

        require(
            keccak256(abi.encode(_poolName)) != keccak256(" "),
            "Pool name can't be empty !"
        );
        require(
            poolNames[_poolName].verified[msg.sender],
            "Sender not verified !"
        );

        if( 
            pool.active && 
            pool.targetPrice.mul(10**uint256(token.decimals)) <= uint256(priceFeedData(token.priceFeed))
        ) { pool.active = false; }
            
        require(
            poolNames[_poolName].active, 
            "Pool not active !"
        );
        _;
    }

    modifier onlyComptroller
    {
        require(
            msg.sender == comptrollerContract,
            "Unauthorized access"
        );
        _;
    }


    function priceFeedData(address _aggregatorAddress) internal view returns (int256)
    {
        ( , int256 price, , , ) = AggregatorV3Interface(_aggregatorAddress).latestRoundData();

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
        require(
            keccak256(abi.encode(tokenData[_symbol].symbol)) != keccak256(abi.encode(_symbol)), 
            "Token data already present !"
        );

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
        string memory _symbol,
        string memory _poolName,
        uint256 _targetPrice,
        address _accountAddress
    ) external 
    {
        TokenData storage poolToken = tokenData[_symbol];

        require(
            keccak256(abi.encode(tokenData[_symbol].symbol)) != keccak256(" "),
            "Token address can't be empty !"
        );
        require(
            keccak256(abi.encode(_poolName)) != keccak256(""),
            "Pool name can't be empty !"
        );
        require(
            keccak256(abi.encode(poolNames[_poolName].poolName)) != keccak256(abi.encode(_poolName)),
            "Pool name already taken !"
        );
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
        newPool.poolScaledAmount = 0;
        newPool.verified[msg.sender] = true;

        emit newPoolCreated(_poolName, msg.sender, _symbol, _targetPrice, block.timestamp);
    }

    function verifyPoolAccess(
        string calldata _poolName,
        bytes32 _messageHash,
        bytes calldata _signature
    ) external 
    {
        Pool storage pool = poolNames[_poolName];

        require(
            keccak256(abi.encode(_poolName)) != keccak256(""),
            "Pool name can't be empty !"
        );
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

    function deposit(
        string calldata _poolName, 
        uint256 _scaledAmount,
        string calldata _tokenSymbol
    ) external checkAccess(_poolName)
    {
        Pool storage pool = poolNames[_poolName];
        
        require(
            keccak256(abi.encode(_tokenSymbol)) == keccak256(abi.encode(pool.symbol)),
            "Deposit token doesn't match pool token !"
        );

        pool.userScaledDeposits[msg.sender] = pool.userScaledDeposits[msg.sender].add(_scaledAmount);
        pool.poolScaledAmount = pool.poolScaledAmount.add(_scaledAmount);

        emit newDeposit(_poolName, msg.sender, _scaledAmount, block.timestamp);
        emit totalUserScaledDeposit(_poolName, msg.sender, pool.userScaledDeposits[msg.sender], block.timestamp);
        emit totalPoolScaledDeposit(_poolName, pool.poolScaledAmount, block.timestamp);
    }

    /// @dev Implement this function for partial amount withdrawal. 
    function withdraw(
        string calldata _poolName,
        uint256 _amount,
        string _tokenSymbol
    ) external checkAccess(_poolName) returns(uint256, bool)
    {
        Pool storage pool = poolNames[_poolName];
        // address lendingPool = ILendingPoolAddressesProvider(lendingPoolAddressProvider).getLendingPool();
        // uint128 liquidityIndex = ILendingPool(lendingPool).getReserveData(poolTokenData.token).liquidityIndex;
        // uint256 reserveNormalizedIncome = ILendingPool(lendingPool).getReserveNormalizedIncome(tokenData[pool.symbol].token);
        // uint256 aTokenAmount;

        require(
            pool.userScaledDeposits[msg.sender] >= _amount,
            "Amount exceeds user's reward amount !"
        );
        // Approving aToken pool
        require(
            IERC20(tokenData[pool.symbol].aToken).approve(lendingPool, _amount),
            "aToken approval failed !"
        );
        /**
         * Reward = UD*RA/PD
         * RA = RA - Reward
         * withdrawalFeeAmount = (UD + Reward)*(WF/10**4)
         * poolReward = withdrawalFeeAmount*4/5
         * RA = RA + poolRewardAmount
         * nominalFee = withdrawalFeeAmount - poolReward
        */
        (_amount == 0)? _amount = pool.userScaledDeposits[msg.sender]:_amount;
        
        uint256 rewardScaledAmount = (_amount.mul(pool.rewardScaledAmount)).div(pool.poolScaledAmount);
        pool.rewardScaledAmount = pool.rewardScaledAmount.sub(rewardScaledAmount);
        pool.poolScaledAmount = pool.poolScaledAmount.sub(_amount); // Test whether only _amount needs to be subtracted.
        pool.userScaledDeposits[msg.sender] = pool.userScaledDeposits[msg.sender].sub(_amount);

        if(pool.active)
        {
            uint256 withdrawalFeeAmount = (
                (_amount.add(rewardScaledAmount))
                .mul(REWARD_FEE_PER)).div(10**4);

            _amount = _amount.sub(withdrawalFeeAmount);
            pool.rewardScaledAmount = pool.rewardScaledAmount.add(withdrawalFeeAmount);
        }

        emit newWithdrawal(_poolName, msg.sender, (_amount.mul(reserveNormalizedIncome)).div(10**27), block.timestamp);
        emit totalUserScaledDeposit(_poolName, msg.sender, pool.userScaledDeposits[msg.sender], block.timestamp);
        emit totalPoolScaledDeposit(_poolName, pool.poolScaledAmount, block.timestamp); 

        return ((_amount.mul(reserveNormalizedIncome)).div(10**27), pool.active);  
    }

    // Functions for testing
    function getVerifiedStatus(string calldata _poolName) external view returns (bool)
    {
        Pool storage pool = poolNames[_poolName];
        return pool.verified[msg.sender];
    }

    function checkOwner() external view returns(address)
    {
        return owner();
    }

    function isPoolEmpty(string calldata _poolName) external view returns(string memory)
    {
        Pool storage pool = poolNames[_poolName];
        return pool.poolName;
    }

    function verifyPool(string calldata _poolName) external view returns (bool)
    {
        Pool storage pool = poolNames[_poolName];
        if (keccak256(abi.encode(pool.poolName)) == keccak256(abi.encode(_poolName))) 
            return true;
        else 
            return false;
    }

    function getUserScaledDeposit(string calldata _poolName) external view returns (uint256)
    {
        Pool storage pool = poolNames[_poolName];
        return pool.userScaledDeposits[msg.sender];
    }

    function getUserScaledBalance(string calldata _poolName) external view returns(uint256)
    {
        address lendingPool = ILendingPoolAddressesProvider(lendingPoolAddressProvider).getLendingPool();
        Pool storage pool = poolNames[_poolName];
        TokenData storage poolTokenData = tokenData[pool.symbol];
        uint128 liquidityIndex = ILendingPool(lendingPool).getReserveData(poolTokenData.token).liquidityIndex;
        return (pool.userScaledDeposits[msg.sender].mul(liquidityIndex)).div(10**27);
    }

    function getPoolScaledAmount(string calldata _poolName) external view returns(uint256)
    {
        Pool storage pool = poolNames[_poolName];
        return pool.poolScaledAmount;
    }

    function getLiquidityIndex(string calldata _poolName) external view returns(uint128)
    {
        Pool storage pool = poolNames[_poolName];
        TokenData storage poolTokenData = tokenData[pool.symbol];
        address lendingPool = ILendingPoolAddressesProvider(lendingPoolAddressProvider).getLendingPool();
        return ILendingPool(lendingPool).getReserveData(poolTokenData.token).liquidityIndex;
    }

    function getReserveData(string calldata _poolName) external view returns(uint128, uint256)
    {
        Pool storage pool = poolNames[_poolName];
        TokenData storage poolTokenData = tokenData[pool.symbol];
        address lendingPool = ILendingPoolAddressesProvider(lendingPoolAddressProvider).getLendingPool();
        uint128 liquidityIndex = ILendingPool(lendingPool).getReserveData(poolTokenData.token).liquidityIndex;
        uint256 reserveNormalizedIncome = ILendingPool(lendingPool).getReserveNormalizedIncome(poolTokenData.token);
        return (liquidityIndex, reserveNormalizedIncome);
    }
    
}
