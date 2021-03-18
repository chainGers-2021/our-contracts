// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

/***
 * Factory Contract for creating private pools
 * @author Chinmay Vemuri
 */
 
contract PrivatePool
{
    address public owner;
    address public token;
    bytes32 publicKey; // Necessary for inviting people
    string public poolName;
    uint256 targetPrice;
    bool initialized;
    
    mapping(address => uint256) userDeposits;
    
    function init(address _owner, address _token, string calldata _poolName, uint256 _targetPrice, bytes32 _publicKey) external
    {
        require(!initialized, "Pool already initialized !");
        
        owner = _owner;
        token = _token;
        poolName = _poolName;
        targetPrice = _targetPrice;
        publicKey = _publicKey;
    }
}