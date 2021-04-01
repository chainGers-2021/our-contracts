// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ECDSA} from "@openzeppelin/contracts/cryptography/ECDSA.sol";
import {
    ILendingPool,
    ILendingPoolAddressesProvider
} from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import "@aave/protocol-v2/contracts/interfaces/IScaledBalanceToken.sol";
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import { Datatypes } from '../Libraries/Datatypes.sol';
import '../Pools/Comptroller.sol';
import '../Interfaces/IPools.sol';

/***
 * Factory Contract for creating private pools
 * @author Chinmay Vemuri
 * Optimizations to be done:
 * 1) Store index instead of the address of the token in a pool
 * 2) Use try/catch for deposit and withdraw functions.
 */

contract PublicPools is IPools, Ownable 
{
    using SafeMath for uint256;
    using Datatypes for *;

    address lendingPoolAddressProvider = 0x88757f2f99175387aB4C6a4b3067c77A695b0349;
    address comptrollerContract;
    uint256 constant REWARD_FEE_PER = 400; // Fee percentage (basis points) given to Pool members.
    mapping(string => Datatypes.PublicPool) public poolNames;

    modifier checkAccess(string calldata _poolName) 
    {
        Datatypes.PublicPool storage pool = poolNames[_poolName];
        (, , , address priceFeed, uint8 decimals) =
            Comptroller(comptrollerContract).tokenData(pool.symbol);

        require(
            keccak256(abi.encode(_poolName)) != keccak256(" "),
            "Pool name can't be empty !"
        );

        if (
            pool.active &&
            pool.targetPrice.mul(10**uint256(decimals)) <= uint256(priceFeedData(priceFeed))
        ) { pool.active = false; }

        require(poolNames[_poolName].active, "Pool not active !");
        _;
    }

    modifier onlyComptroller 
    {
        require(msg.sender == comptrollerContract, "Unauthorized access");
        _;
    }

    

    function calculateWithdrawalAmount(
        string calldata _poolName,
        uint256 _amount,
        address _sender
    ) internal returns(uint256) 
    {
        uint256 rewardScaledAmount = (_amount.mul(poolNames[_poolName].rewardScaledAmount))
                                        .div(poolNames[_poolName].poolScaledAmount);
        poolNames[_poolName].rewardScaledAmount = poolNames[_poolName].rewardScaledAmount.sub(rewardScaledAmount);
        poolNames[_poolName].poolScaledAmount = poolNames[_poolName].poolScaledAmount.sub(_amount); // Test whether only _amount needs to be subtracted.
        poolNames[_poolName].userScaledDeposits[_sender] = poolNames[_poolName].userScaledDeposits[_sender]
                                                            .sub(_amount);

        if (poolNames[_poolName].active) 
        {
            uint256 withdrawalFeeAmount = ((_amount.add(rewardScaledAmount)).mul(REWARD_FEE_PER))
                                            .div(10**4);

            _amount = _amount.sub(withdrawalFeeAmount);
            poolNames[_poolName].rewardScaledAmount = poolNames[_poolName].rewardScaledAmount
                                                        .add(withdrawalFeeAmount);
        }

        return _amount;
    }

    function createPool(
        string memory _symbol,
        string memory _poolName,
        uint256 _targetPrice,
        address _accountAddress
    ) external override onlyOwner {
        (, , , address priceFeed, uint8 decimals) =
            Comptroller(comptrollerContract).tokenData(_symbol);

        require(
            keccak256(abi.encode(_symbol)) != keccak256(""),
            "Token symbol can't be empty !"
        );
        require(
            keccak256(abi.encode(_poolName)) != keccak256(""),
            "Pool name can't be empty !"
        );
        require(
            keccak256(abi.encode(poolNames[_poolName].poolName)) !=
                keccak256(abi.encode(_poolName)),
            "Pool name already taken !"
        );
        require(
            _targetPrice >
                uint256(priceFeedData(priceFeed)).div(10**uint256(decimals)),
            "Target price is lesser than current price"
        );

        Datatypes.PublicPool storage newPool = poolNames[_poolName];

        newPool.poolName = _poolName;
        newPool.owner = msg.sender;
        newPool.symbol = _symbol;
        newPool.accountAddress = _accountAddress;
        newPool.targetPrice = _targetPrice;
        newPool.active = true;
        newPool.poolScaledAmount = 0;

        emit newPoolCreated(
            _poolName,
            msg.sender,
            _symbol,
            _targetPrice,
            block.timestamp
        );
    }

    function deposit(
        string calldata _poolName,
        uint256 _scaledAmount,
        string calldata _tokenSymbol,
        address _sender
    ) external override checkAccess(_poolName) 
    {
        Datatypes.PublicPool storage pool = poolNames[_poolName];

        require(
            keccak256(abi.encode(_tokenSymbol)) == keccak256(abi.encode(pool.symbol)),
            "Deposit token doesn't match pool token !"
        );

        pool.userScaledDeposits[_sender] = pool.userScaledDeposits[_sender].add(_scaledAmount);
        pool.poolScaledAmount = pool.poolScaledAmount.add(_scaledAmount);

        emit newDeposit(_poolName, _sender, _scaledAmount, block.timestamp);
        emit totalUserScaledDeposit(
            _poolName,
            _sender,
            pool.userScaledDeposits[_sender],
            block.timestamp
        );
        emit totalPoolScaledDeposit(
            _poolName,
            pool.poolScaledAmount,
            block.timestamp
        );
    }

    function withdraw(
        string calldata _poolName,
        uint256 _amount,
        address _sender
    )
        external
        override
        onlyComptroller
        checkAccess(_poolName)
        returns (uint256)
    {
        uint256 reserveNormalizedIncome;

        // Scoping out the variables to avoid stack too deep errors
        {
            (, address token, , , ) = Comptroller(comptrollerContract).tokenData(poolNames[_poolName].symbol);
            address lendingPool = ILendingPoolAddressesProvider(lendingPoolAddressProvider).getLendingPool();
            reserveNormalizedIncome = ILendingPool(lendingPool).getReserveNormalizedIncome(token);
            _amount = (_amount.mul(10**27)).div(reserveNormalizedIncome);
            (_amount == 0)? _amount = poolNames[_poolName].userScaledDeposits[_sender]: _amount;
        }

        require(
            poolNames[_poolName].userScaledDeposits[_sender] >= _amount,
            "Amount exceeds user's reward amount !"
        );
        /**
         * Reward = UD*RA/PD
         * RA = RA - Reward
         * withdrawalFeeAmount = (UD + Reward)*(WF/10**4)
         * poolReward = withdrawalFeeAmount*4/5
         * RA = RA + poolRewardAmount
         * nominalFee = withdrawalFeeAmount - poolReward
         */

        _amount = calculateWithdrawalAmount(_poolName, _amount, _sender);

        emit newWithdrawal(
            _poolName,
            _sender,
            (_amount.mul(reserveNormalizedIncome)).div(10**27),
            block.timestamp
        );
        emit totalPoolDeposit(
            _poolName,
            (_amount.mul(reserveNormalizedIncome)).div(10**27), 
            block.timestamp
        );
        emit totalUserScaledDeposit(
            _poolName,
            _sender,
            poolNames[_poolName].userScaledDeposits[_sender],
            block.timestamp
        );
        emit totalPoolScaledDeposit(
            _poolName,
            poolNames[_poolName].poolScaledAmount,
            block.timestamp
        );

        return (_amount);
    }

    function setComptroller(address _comptroller) external onlyOwner 
    {
        comptrollerContract = _comptroller;
    }

    function priceFeedData(address _aggregatorAddress)
        internal
        view
        returns (int256)
    {
        (, int256 price, , , ) = AggregatorV3Interface(_aggregatorAddress).latestRoundData();

        return price;
    }
    
    // Functions for testing
    function checkOwner() external view returns (address) {
        return owner();
    }

    function isPoolEmpty(string calldata _poolName)
        external
        view
        returns (string memory)
    {
        Datatypes.PublicPool storage pool = poolNames[_poolName];
        return pool.poolName;
    }

    function verifyPool(string calldata _poolName)
        external
        view
        returns (bool)
    {
        Datatypes.PublicPool storage pool = poolNames[_poolName];
        if (
            keccak256(abi.encode(pool.poolName)) ==
            keccak256(abi.encode(_poolName))
        ) return true;
        else return false;
    }

    function getUserScaledDeposit(string calldata _poolName)
        external
        view
        returns (uint256)
    {
        Datatypes.PublicPool storage pool = poolNames[_poolName];
        return pool.userScaledDeposits[msg.sender];
    }

    function getUserScaledBalance(string calldata _poolName)
        external
        view
        returns (uint256)
    {
        address lendingPool =
            ILendingPoolAddressesProvider(lendingPoolAddressProvider)
                .getLendingPool();
        Datatypes.PublicPool storage pool = poolNames[_poolName];
        (, address token, , , ) =
            Comptroller(comptrollerContract).tokenData(pool.symbol);
        uint256 reserveNormalizedIncome =
            ILendingPool(lendingPool).getReserveNormalizedIncome(token);

        return
            (pool.userScaledDeposits[msg.sender].mul(reserveNormalizedIncome))
                .div(10**27);
    }

    function getPoolScaledAmount(string calldata _poolName)
        external
        view
        returns (uint256)
    {
        Datatypes.PublicPool storage pool = poolNames[_poolName];
        return pool.poolScaledAmount;
    }

    function getLiquidityIndex(string calldata _poolName)
        external
        view
        returns (uint128)
    {
        Datatypes.PublicPool storage pool = poolNames[_poolName];
        (, address token, , , ) =
            Comptroller(comptrollerContract).tokenData(pool.symbol);
        address lendingPool =
            ILendingPoolAddressesProvider(lendingPoolAddressProvider)
                .getLendingPool();
        return ILendingPool(lendingPool).getReserveData(token).liquidityIndex;
    }

    function getReserveData(string calldata _poolName)
        external
        view
        returns (uint128, uint256)
    {
        Datatypes.PublicPool memory pool = poolNames[_poolName];
        (, address token, , , ) =
            Comptroller(comptrollerContract).tokenData(pool.symbol);
        address lendingPool =
            ILendingPoolAddressesProvider(lendingPoolAddressProvider)
                .getLendingPool();
        uint128 liquidityIndex =
            ILendingPool(lendingPool).getReserveData(token).liquidityIndex;
        uint256 reserveNormalizedIncome =
            ILendingPool(lendingPool).getReserveNormalizedIncome(token);

        return (liquidityIndex, reserveNormalizedIncome);
    }
}