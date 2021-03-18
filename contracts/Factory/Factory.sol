// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

import "../Utils/CloneFactory.sol";
import "../Pools/PrivatePool.sol";

/***
 * Factory Contract for creating private pools
 * @author Chinmay Vemuri
 */

contract Factory is CloneFactory
{
    address admin;
    address public implementation;
    mapping(string => address) public poolNames;
    mapping(address => address) public tokenAndaTokenAddress;
    
    
    event newTokenAdded(address _token, address _aToken);
    event newPoolCreated(address _poolAddress, address indexed _owner, address indexed _token, string _poolName, uint256 _targetPrice);
    
    
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
        poolNames[_poolName] = newPool;
        
        emit newPoolCreated(address(newPool), msg.sender, _token, _poolName, _targetPrice);
    }
}
 