// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/solc-0.6/contracts/access/Ownable.sol';
import { ECDSA } from 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/solc-0.6/contracts/cryptography/ECDSA.sol';
import { IERC20 } from 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/solc-0.6/contracts/token/ERC20/IERC20.sol';
import { SafeMath } from 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/solc-0.6/contracts/math/SafeMath.sol';
import { ILendingPool, ILendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import '@aave/protocol-v2/contracts/interfaces/IScaledBalanceToken.sol';

/***
 * Factory Contract for creating private pools
 * @dev Check if biconomy doesn't require such a factory-child pattern for Forward payments
 * @author Chinmay Vemuri
 */
contract PrivatePool is Ownable
{
    
    using ECDSA for bytes32;
    using SafeMath for uint256;
    
    address lendingPoolAddressProvider = address('0x88757f2f99175387aB4C6a4b3067c77A695b0349');
    mapping(address => address) public tokenAndaTokenAddress;
    
    struct Pool
    {
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
    event newPoolCreated(string indexed _poolName, address indexed _owner, address _token, uint256 _targetPrice);
    event verified(string indexed _poolName, address _sender);
    event unVerified(string indexed _poolName, address _sender);



    // modifier onlyAdmin
    // {
    //     require(msg.sender == admin, "Only admin can use this function !");
    //     _;
    // }
    
    modifier onlyVerified(string calldata _poolName)
    {
        require(poolNames[_poolName].verified[msg.sender], "Sender not verified !");
        _;
    }


    // constructor() public
    // {
    //     admin = msg.sender;
    // }
    
    function addTokenAddress(address _token, address _aToken) external onlyOwner
    {
        tokenAndaTokenAddress[_token] = _aToken;
        
        emit newTokenAdded(_token, _aToken);
    }
    
    function createPool(address _token, string calldata _poolName, uint256 _targetPrice, address _accountAddress) external
    {
        require(tokenAndaTokenAddress[_token] != address(0), "Invalid token address !");
        require(bytes(poolNames[_poolName].poolName).length == 0, "Pool name already taken !");
        // Add another condition that _targetPrice must be greater than the present price ?
        
        Pool storage newPool = poolNames[_poolName];
        
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
    
    function verifyPoolAccess(string calldata _poolName, bytes32 _messageHash, bytes calldata _signature) external
    {
        Pool storage pool = poolNames[_poolName];
        require(_messageHash.recover(_signature) == poolNames[_poolName].accountAddress, "Verification failed");
        require(!pool.signatures[_signature], "Unauthorized access: Reusing signature");
        
        pool.verified[msg.sender] = true;
        pool.signatures[_signature] = true;
    }
    
    // Complete this
    function depositERC20(string calldata _poolName, uint256 _amount) external
    {
        Pool storage pool = poolNames[_poolName];
        require(pool.verified[msg.sender], "Sender not verified !");
        
        // Checking if user has allowed this contract to spend
		require( _amount <= IERC20(pool.token).allowance(msg.sender, address(this)), "Amount exceeds allowance limit !");
		// Transfering tokens into this account
		require(IERC20(pool.token).transferFrom(msg.sender, address(this), _amount) == true);
		
		// Transfering into Lending Pool
		IERC20(pool.token).approve(address(this), _amount);
		
		ILendingPool(ILendingPoolAddressesProvider.getLendingPool()).deposit(pool.token, _amount, address(this), 0);
        
        
    }

    // Functions for testing
    // function getVerifiedStatus(string calldata _poolName) external view returns(bool)
    // {
    //     return PrivatePool(poolNames[_poolName]).verified(msg.sender);
    // }


}
 