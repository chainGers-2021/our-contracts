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



/***
 * Factory Contract for creating private pools
 * @author Chinmay Vemuri
 * Optimizations to be done:
 * 1) Store index instead of the address of the token in a pool
 */

contract PrivatePools is Ownable {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    // address priceFeedAddress;
    // address lendingPoolAddressProviderAdddress;
    address lendingPoolAddressProviderAdddress = 0x88757f2f99175387aB4C6a4b3067c77A695b0349;
    address priceFeedAddress = 0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0;

    mapping(address => address) public tokenAndaTokenAddress;

    struct Pool {
        string poolName;
        address owner;
        address token;
        address accountAddress;
        uint256 targetPrice;
        mapping(address => bool) verified;
        mapping(bytes => bool) signatures;
        mapping(address => uint256) userDeposits;
    }

    mapping(string => Pool) public poolNames;

    event newTokenAdded(address _token, address _aToken);
    event newPoolCreated(
        string indexed _poolName,
        address indexed _owner,
        address _token,
        uint256 _targetPrice
    );
    event verified(string indexed _poolName, address _sender);
    event unVerified(string indexed _poolName, address _sender);

    // modifier onlyAdmin
    // {
    //     require(msg.sender == admin, "Only admin can use this function !");
    //     _;
    // }

    modifier onlyVerified(string calldata _poolName) {
        require(
            poolNames[_poolName].verified[msg.sender],
            "Sender not verified !"
        );
        _;
    }

    constructor() public
    {
        // admin = msg.sender;

    }

    function addTokenAddress(address _token, address _aToken)
        external
        onlyOwner
    {
        tokenAndaTokenAddress[_token] = _aToken;

        emit newTokenAdded(_token, _aToken);
    }

    function createPool(
        address _token,
        string calldata _poolName,
        uint256 _targetPrice,
        address _accountAddress
    ) external {
        require(
            tokenAndaTokenAddress[_token] != address(0),
            "Invalid token address !"
        );
        require(
            bytes(poolNames[_poolName].poolName).length == 0,
            "Pool name already taken !"
        );
        // Add another condition that _targetPrice must be greater than the present price ?

        Pool storage newPool = poolNames[_poolName];

        newPool.poolName = _poolName;
        newPool.owner = msg.sender;
        newPool.token = _token;
        newPool.accountAddress = _accountAddress;
        newPool.targetPrice = _targetPrice;
        newPool.verified[msg.sender] = true;

        emit newPoolCreated(_poolName, msg.sender, _token, _targetPrice);
    }

    /// @dev Maybe verification can be done off-chain ?
    // function verifyPoolAccess(string calldata _poolName, bytes32 _messageHash, uint8 v, bytes32 r, bytes32 s) external returns(bool)
    // {
    //     Pool storage pool = poolNames[_poolName];

    //     require(!pool.verified[msg.sender], "Sender already verified !");
    //     require(!pool.signatures[_messageHash], "Unauthorized access: Reusing signature");

    //     if(ecrecover(_messageHash, v, r, s) == pool.accountAddress)
    //     {
    //         pool.verified[msg.sender] = true;
    //         pool.signatures[_messageHash] = true;
    //         emit verified(_poolName, msg.sender);
    //         return true;
    //     }

    //     else
    //     {
    //         emit unVerified(_poolName, msg.sender);
    //         return false;
    //     }

    // }

    function verifyPoolAccess(
        string calldata _poolName,
        bytes32 _messageHash,
        bytes calldata _signature
    ) external {
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

    // Complete this
    function depositERC20(string calldata _poolName, uint256 _amount) external {
        Pool storage pool = poolNames[_poolName];
        require(pool.verified[msg.sender], "Sender not verified !");

        // ERC20 token = ERC20(pool.token);
        IERC20 token = IERC20(pool.token);
        // Checking if user has allowed this contract to spend
        require(
            _amount <= token.allowance(msg.sender, address(this)),
            "Amount exceeds allowance limit !"
        );

        
        // Transfering tokens into this account
        require(
            token.transferFrom(
                msg.sender,
                address(this),
                _amount
            ),
            "Unable to transferFrom() to the contract."
        );
        address lendingPool = ILendingPoolAddressesProvider(lendingPoolAddressProviderAdddress).getLendingPool();


        // Transfering into Lending Pool
        require(token.approve(lendingPool, _amount), "Approval failed");

        ILendingPool(lendingPool).deposit( pool.token, _amount, address(this), 0);

        uint128 liquidityIndex = ILendingPool(lendingPool).getReserveData(pool.token).liquidityIndex;
        pool.userDeposits[msg.sender] += (_amount.mul(10**27)).div(liquidityIndex);
    }

    // Functions for testing
    function getVerifiedStatus(string calldata _poolName) external view returns(bool)
    {
        Pool storage pool = poolNames[_poolName];
        return pool.verified[msg.sender];
    }

    function verifyPool(string calldata _poolName) external view returns(bool)
    {
        Pool memory pool = poolNames[_poolName];
        if(keccak256(abi.encode(pool.poolName)) == keccak256(abi.encode(_poolName)))
            return true;
        else
            return false;
    }

    function getUserDeposit(string calldata _poolName) external view returns(uint256)
    {
        Pool storage pool = poolNames[_poolName];
        return pool.userDeposits[msg.sender];
    }

    // make it internal
    function priceFeedData(address _aggregatorAddress) public view returns(int){
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = AggregatorV3Interface(_aggregatorAddress).latestRoundData();
        return price;
    }
}
