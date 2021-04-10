// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ILendingPool, ILendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import { Datatypes } from '../Libraries/Datatypes.sol';
import { ScaledMath } from '../Libraries/ScaledMath.sol';
import './Comptroller.sol';
import '../Interfaces/IPools.sol';

/***
 * Public pool creation and functions related to public pools.
 * These pools can only be created by developers
 * @author Chinmay Vemuri
 */

contract PublicPools is IPools, Ownable 
{
    using SafeMath for uint256;
    using ScaledMath for uint256;
    using Datatypes for *;


    address lendingPoolAddressProvider = 0x88757f2f99175387aB4C6a4b3067c77A695b0349;
    address comptrollerContract;
    uint256 constant REWARD_FEE_PER = 400; // Fee percentage (basis points) given to Pool members.
    mapping(string => Datatypes.PublicPool) public poolNames;


    modifier checkPoolName(string calldata _poolName)
    {
        require(
            keccak256(abi.encode(_poolName)) != keccak256(abi.encode('')),
            "Pool name can't be empty !"
        );
        _;
    }

    modifier onlyComptroller 
    {
        require(msg.sender == comptrollerContract, "Unauthorized access");
        _;
    }


    constructor(address _comptrollerContract) public
    {
        comptrollerContract = _comptrollerContract;
    }

    function createPool(
        string calldata _symbol,
        string calldata _poolName,
        uint256 _targetPrice
    ) 
        external
        checkPoolName(_poolName) 
        onlyOwner 
    {
        require(
            keccak256(abi.encode(_symbol)) != keccak256(abi.encode("")),
            "Token symbol can't be empty !"
        );

        (, , , address priceFeed, uint8 decimals) = Comptroller(comptrollerContract).tokenData(_symbol);

        require(
            priceFeed != address(0),
            "Token/pricefeed doesn't exist"
        );
        require(
            keccak256(abi.encode(poolNames[_poolName].poolName)) != keccak256(abi.encode(_poolName)),
            "Pool name already taken !"
        );
        require(
            _targetPrice.mul(10**uint256(decimals)) > uint256(priceFeedData(priceFeed)),
            "Target price is lesser than current price"
        );

        Datatypes.PublicPool storage newPool = poolNames[_poolName];

        newPool.poolName = _poolName;
        newPool.owner = msg.sender;
        newPool.symbol = _symbol;
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
        address _sender
    ) 
        external 
        override 
        checkPoolName(_poolName)
        onlyComptroller 
    {
        Datatypes.PublicPool storage pool = poolNames[_poolName];

        if(pool.active)
            checkPoolBreak(_poolName);

        require(
            poolNames[_poolName].active, 
            "Pool not active !"
        );

        pool.userScaledDeposits[_sender] = pool.userScaledDeposits[_sender].add(_scaledAmount);
        pool.poolScaledAmount = pool.poolScaledAmount.add(_scaledAmount);

        emit newDeposit(
            _poolName, 
            _sender, 
            _scaledAmount, 
            block.timestamp
        );
        emit totalPoolDeposit(
            _poolName,
           pool.poolScaledAmount.scaledToReal(
                Comptroller(comptrollerContract).getReserveIncome(pool.symbol)
            ),
            block.timestamp
        );
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
        checkPoolName(_poolName)
        returns (uint256)
    {
        if(poolNames[_poolName].active)
            checkPoolBreak(_poolName);

        // Converting the given amount to scaled amount
        uint256 scaledAmount = _amount.realToScaled(Comptroller(comptrollerContract).getReserveIncome(poolNames[_poolName].symbol));
        (scaledAmount == 0)? scaledAmount = poolNames[_poolName].userScaledDeposits[_sender]: scaledAmount;
        
        require(
            poolNames[_poolName].userScaledDeposits[_sender] >= scaledAmount,
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

        scaledAmount = calculateWithdrawalAmount(_poolName, scaledAmount, _sender);
        _amount = scaledAmount.scaledToReal(Comptroller(comptrollerContract).getReserveIncome(poolNames[_poolName].symbol));

        emit newWithdrawal(
            _poolName,
            _sender,
            scaledAmount,
            block.timestamp
        );
        emit totalPoolDeposit(
            _poolName,
            _amount, 
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

    function checkPoolBreak(string calldata _poolName) internal
    {
        Datatypes.PublicPool storage pool = poolNames[_poolName];
        (, , , address priceFeed, uint8 decimals) = Comptroller(comptrollerContract).tokenData(pool.symbol);

        if (
            pool.active &&
            pool.targetPrice.mul(10**uint256(decimals)) <= uint256(priceFeedData(priceFeed))
        ) { pool.active = false; }
    }

    function calculateWithdrawalAmount(
        string calldata _poolName,
        uint256 _amount, // This is scaled amount
        address _sender
    ) internal returns(uint256) 
    {
        uint256 rewardScaledAmount = (_amount.mul(poolNames[_poolName].rewardScaledAmount)).div(poolNames[_poolName].poolScaledAmount);
        poolNames[_poolName].rewardScaledAmount = poolNames[_poolName].rewardScaledAmount.sub(rewardScaledAmount);
        poolNames[_poolName].poolScaledAmount = poolNames[_poolName].poolScaledAmount.sub(_amount); // Test whether only _amount needs to be subtracted.
        poolNames[_poolName].userScaledDeposits[_sender] = poolNames[_poolName].userScaledDeposits[_sender].sub(_amount);

        if(poolNames[_poolName].active) 
        {
            uint256 withdrawalFeeAmount = ((_amount.add(rewardScaledAmount)).mul(REWARD_FEE_PER))
                                            .div(10**4);

            _amount = _amount.sub(withdrawalFeeAmount);
            poolNames[_poolName].rewardScaledAmount = poolNames[_poolName].rewardScaledAmount
                                                        .add(withdrawalFeeAmount);
        }

        return _amount;
    }

    function priceFeedData(address _aggregatorAddress)
        internal
        view
        returns (int256)
    {
        (, int256 price, , , ) = AggregatorV3Interface(_aggregatorAddress).latestRoundData();

        return price;
    }
}
