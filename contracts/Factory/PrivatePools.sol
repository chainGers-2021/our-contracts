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

/***
 * Factory Contract for creating private pools
 * @author Chinmay Vemuri
 * Optimizations to be done:
 * 1) Store index instead of the address of the token in a pool
 * 2) Use try/catch for deposit and withdraw functions.
 */

struct TokenData {
    string symbol;
    address token;
    address aToken;
    address priceFeed;
    uint8 decimals;
    uint256 nominalFeeScaledAmount; // Increases or decreases every time a deposit or withdrawal is made.
}

struct Pool {
    string poolName;
    string symbol;
    bool active;
    address owner;
    address accountAddress;
    uint256 targetPrice;
    // uint256 poolAmount;
    uint256 poolScaledAmount;
    uint256 rewardScaledAmount;
    mapping(address => bool) verified;
    mapping(bytes => bool) signatures;
    // mapping(address => uint256) userDeposits;
    mapping(address => uint256) userScaledDeposits;
}

contract PrivatePools is Ownable {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    address lendingPoolAddressProvider =
        0x88757f2f99175387aB4C6a4b3067c77A695b0349;
    uint256 constant NGO_FEE_PER = 100; // Fee percentage (basis points) given to NGOs.
    uint256 constant REWARD_FEE_PER = 400; // Fee percentage (basis points) given to Pool members.
    mapping(string => TokenData) public tokenData;
    mapping(string => Pool) public poolNames;

    event newTokenAdded(string _symbol, address _token, address _aToken);
    event newPoolCreated(
        string indexed _poolName,
        address indexed _owner,
        string symbol,
        uint256 _targetPrice,
        uint256 _timeStamp
    );
    event verified(
        string indexed _poolName,
        address _sender,
        uint256 _timeStamp
    );
    event newDeposit(
        string indexed _poolName,
        address indexed _sender,
        uint256 _amount,
        uint256 _timeStamp
    );
    event totalUserScaledDeposit(
        string indexed _poolName,
        address indexed _sender,
        uint256 _amount,
        uint256 _timestamp
    );
    event totalPoolScaledDeposit(
        string indexed _poolName,
        uint256 _amount,
        uint256 _timestamp
    );
    event newWithdrawal(
        string indexed _poolName,
        address indexed _sender,
        uint256 _amount,
        uint256 _timeStamp
    );

    modifier checkAccess(string calldata _poolName) {
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

        if (
            pool.active &&
            pool.targetPrice.mul(10**uint256(token.decimals)) <=
            uint256(priceFeedData(token.priceFeed))
        ) {
            pool.active = false;
        }

        require(poolNames[_poolName].active, "Pool not active !");
        _;
    }

    function priceFeedData(address _aggregatorAddress)
        internal
        view
        returns (int256)
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
    ) external onlyOwner {
        require(
            keccak256(abi.encode(tokenData[_symbol].symbol)) !=
                keccak256(abi.encode(_symbol)),
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
    ) external {
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
            keccak256(abi.encode(poolNames[_poolName].poolName)) !=
                keccak256(abi.encode(_poolName)),
            "Pool name already taken !"
        );
        require(
            _targetPrice >
                uint256(priceFeedData(poolToken.priceFeed)).div(
                    10**uint256(poolToken.decimals)
                ),
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

        emit newPoolCreated(
            _poolName,
            msg.sender,
            _symbol,
            _targetPrice,
            block.timestamp
        );
    }

    function verifyPoolAccess(
        string calldata _poolName,
        bytes32 _messageHash,
        bytes calldata _signature
    ) external {
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

    function depositERC20(string calldata _poolName, uint256 _amount)
        external
        checkAccess(_poolName)
    {
        Pool storage pool = poolNames[_poolName];
        TokenData storage poolTokenData = tokenData[pool.symbol];
        IERC20 token = IERC20(poolTokenData.token);
        address lendingPool =
            ILendingPoolAddressesProvider(lendingPoolAddressProvider)
                .getLendingPool();

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
        // Approving lendingPool for amount transfer
        require(token.approve(lendingPool, _amount), "Approval failed !");

        // Depositing user amount to the lendingPool
        ILendingPool(lendingPool).deposit(
            poolTokenData.token,
            _amount,
            address(this),
            0
        );

        // Dealing with scaledBalances here.
        // uint128 liquidityIndex = ILendingPool(lendingPool).getReserveData(poolTokenData.token).liquidityIndex;
        // uint256 newUserScaledDeposit = (_amount.mul(10**27)).div(liquidityIndex);
        uint256 reserveNormalizedIncome =
            ILendingPool(lendingPool).getReserveNormalizedIncome(
                poolTokenData.token
            );
        uint256 newUserScaledDeposit =
            (_amount.mul(10**27)).div(reserveNormalizedIncome);

        // pool.userDeposits[msg.sender] = pool.userDeposits[msg.sender].add(_amount);
        // pool.poolAmount = pool.poolAmount.add(_amount);
        pool.userScaledDeposits[msg.sender] = pool.userScaledDeposits[
            msg.sender
        ]
            .add(newUserScaledDeposit);
        pool.poolScaledAmount = pool.poolScaledAmount.add(newUserScaledDeposit);

        emit newDeposit(_poolName, msg.sender, _amount, block.timestamp);
        emit totalUserScaledDeposit(
            _poolName,
            msg.sender,
            pool.userScaledDeposits[msg.sender],
            block.timestamp
        );
        emit totalPoolScaledDeposit(
            _poolName,
            pool.poolScaledAmount,
            block.timestamp
        );
    }

    /// @dev Implement this function for partial amount withdrawal.
    function withdrawERC20(string calldata _poolName, uint256 _amount)
        external
        checkAccess(_poolName)
    {
        Pool storage pool = poolNames[_poolName];
        // TokenData storage poolTokenData = tokenData[pool.symbol];
        // IERC20 aToken = IERC20(poolTokenData.aToken);
        address lendingPool =
            ILendingPoolAddressesProvider(lendingPoolAddressProvider)
                .getLendingPool();
        // uint128 liquidityIndex = ILendingPool(lendingPool).getReserveData(poolTokenData.token).liquidityIndex;
        uint256 reserveNormalizedIncome =
            ILendingPool(lendingPool).getReserveNormalizedIncome(
                tokenData[pool.symbol].token
            );
        // uint256 aTokenAmount;

        require(
            (pool.userScaledDeposits[msg.sender].mul(reserveNormalizedIncome))
                .div(10**27) >= _amount,
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
        (_amount != 0)
            ? _amount = (_amount.mul(10**27)).div(reserveNormalizedIncome)
            : _amount = pool.userScaledDeposits[msg.sender];

        uint256 rewardScaledAmount =
            (_amount.mul(pool.rewardScaledAmount)).div(pool.poolScaledAmount);
        pool.rewardScaledAmount = pool.rewardScaledAmount.sub(
            rewardScaledAmount
        );
        pool.poolScaledAmount = pool.poolScaledAmount.sub(_amount); // Test whether only _amount needs to be subtracted.
        pool.userScaledDeposits[msg.sender] = pool.userScaledDeposits[
            msg.sender
        ]
            .sub(_amount);

        if (pool.active) {
            uint256 withdrawalFeeAmount =
                (
                    (_amount.add(rewardScaledAmount)).mul(
                        NGO_FEE_PER + REWARD_FEE_PER
                    )
                )
                    .div(10**4);
            _amount = _amount.sub(withdrawalFeeAmount);
            uint256 poolRewardAmount = (withdrawalFeeAmount.mul(4)).div(5);
            pool.rewardScaledAmount = pool.rewardScaledAmount.add(
                poolRewardAmount
            );
            tokenData[pool.symbol].nominalFeeScaledAmount = tokenData[
                pool.symbol
            ]
                .nominalFeeScaledAmount
                .add(withdrawalFeeAmount.sub(poolRewardAmount));
        }

        ILendingPool(lendingPool).withdraw(
            tokenData[pool.symbol].token,
            (_amount.mul(reserveNormalizedIncome)).div(10**27),
            msg.sender
        );

        emit newWithdrawal(
            _poolName,
            msg.sender,
            (_amount.mul(reserveNormalizedIncome)).div(10**27),
            block.timestamp
        );
        emit totalUserScaledDeposit(
            _poolName,
            msg.sender,
            pool.userScaledDeposits[msg.sender],
            block.timestamp
        );
        emit totalPoolScaledDeposit(
            _poolName,
            pool.poolScaledAmount,
            block.timestamp
        );
    }

    // Functions for testing
    function getVerifiedStatus(string calldata _poolName)
        external
        view
        returns (bool)
    {
        Pool storage pool = poolNames[_poolName];
        return pool.verified[msg.sender];
    }

    function checkOwner() external view returns (address) {
        return owner();
    }

    function isPoolEmpty(string calldata _poolName)
        external
        view
        returns (string memory)
    {
        Pool storage pool = poolNames[_poolName];
        return pool.poolName;
    }

    function verifyPool(string calldata _poolName)
        external
        view
        returns (bool)
    {
        Pool storage pool = poolNames[_poolName];
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
        Pool storage pool = poolNames[_poolName];
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
        Pool storage pool = poolNames[_poolName];
        TokenData storage poolTokenData = tokenData[pool.symbol];
        uint128 liquidityIndex =
            ILendingPool(lendingPool)
                .getReserveData(poolTokenData.token)
                .liquidityIndex;
        return
            (pool.userScaledDeposits[msg.sender].mul(liquidityIndex)).div(
                10**27
            );
    }

    function getPoolScaledAmount(string calldata _poolName)
        external
        view
        returns (uint256)
    {
        Pool storage pool = poolNames[_poolName];
        return pool.poolScaledAmount;
    }

    function getLiquidityIndex(string calldata _poolName)
        external
        view
        returns (uint128)
    {
        Pool storage pool = poolNames[_poolName];
        TokenData storage poolTokenData = tokenData[pool.symbol];
        address lendingPool =
            ILendingPoolAddressesProvider(lendingPoolAddressProvider)
                .getLendingPool();
        return
            ILendingPool(lendingPool)
                .getReserveData(poolTokenData.token)
                .liquidityIndex;
    }

    function getReserveData(string calldata _poolName)
        external
        view
        returns (uint128, uint256)
    {
        Pool storage pool = poolNames[_poolName];
        TokenData storage poolTokenData = tokenData[pool.symbol];
        address lendingPool =
            ILendingPoolAddressesProvider(lendingPoolAddressProvider)
                .getLendingPool();
        uint128 liquidityIndex =
            ILendingPool(lendingPool)
                .getReserveData(poolTokenData.token)
                .liquidityIndex;
        uint256 reserveNormalizedIncome =
            ILendingPool(lendingPool).getReserveNormalizedIncome(
                poolTokenData.token
            );
        return (liquidityIndex, reserveNormalizedIncome);
    }
}
