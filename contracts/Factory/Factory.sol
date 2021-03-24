// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

import "../Utils/CloneFactory.sol";
import "../Pools/PrivatePool.sol";

/***
 * Factory Contract for creating private pools
 * @dev Check if biconomy doesn't require such a factory-child pattern for Forward payments
 * @author Chinmay Vemuri
 */
contract Factory is CloneFactory
{
    address admin;
    address public implementation;
    mapping(string => uint256[2]) public poolNames;
    mapping(address => address) public tokenAndaTokenAddress;
    
    
    event newTokenAdded(address _token, address _aToken);
    event newPoolCreated(address _poolAddress, address indexed _owner, address indexed _token, string _poolName, uint256 _targetPrice);
    event verified(address _sender, address indexed _pool);
    event unVerified(address _sender, address indexed _pool);



    modifier onlyAdmin
    {
        require(msg.sender == admin, "Only admin can use this function !");
        _;
    }
    


    constructor(address _implementation) public
    {
        admin = msg.sender;
        implementation = _implementation;
    }
    
    function setImplementation(address _implementation) external onlyAdmin
    {
        require(msg.sender == admin, "Only admin can change the implementation contract");
        implementation = _implementation;
    }
    
    function addTokenAddress(address _token, address _aToken) external onlyAdmin
    {
        tokenAndaTokenAddress[_token] = _aToken;
        
        emit newTokenAdded(_token, _aToken);
    }
    
    function createPool(address _token, string calldata _poolName, uint256 _targetPrice, address _accountAddress) external
    {
        require(tokenAndaTokenAddress[_token] != address(0), "Invalid token address !");
        require(poolNames[_poolName] == address(0), "Pool name already taken !");
        // Add another condition that _targetPrice must be greater than the present price ?
        
        address newPool = createClone(implementation);
        PrivatePool(newPool).init(msg.sender, _token, _poolName, _targetPrice, _accountAddress);
        poolNames[_poolName][0] = newPool; // Pool address
        poolName[_poolName][1] = _token; // Token address
        
        emit newPoolCreated(address(newPool), msg.sender, _token, _poolName, _targetPrice);
    }

    function factoryVerify(string calldata _poolName, bytes32 _messageHash, uint8 v, bytes32 r, bytes32 s) external
    {
        if(PrivatePool(poolNames[_poolName]).poolVerify(msg.sender, _messageHash, v, r, s))
            emit verified(msg.sender, poolNames[_poolName]);
        else
            emit unVerified(msg.sender, poolNames[_poolName]);
    }

    function deposit(string calldata _poolName, address _tokenAddr) external 
    {
        pool = PrivatePool(poolNames[_poolName][0]);
        require(pool.verified(msg.sender), "Sender not verified !");
        
    }

    // Functions for testing
    function getVerifiedStatus(string calldata _poolName) external view returns(bool)
    {
        return PrivatePool(poolNames[_poolName]).verified(msg.sender);
    }


}
 