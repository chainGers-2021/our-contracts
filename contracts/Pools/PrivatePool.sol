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
    address public accountAddress; // Necessary for inviting people
    string public poolName;
    uint256 public targetPrice;
    bool public initialized;
    
    mapping(address => uint256) userDeposits;
    
    function init(address _owner, address _token, string calldata _poolName, uint256 _targetPrice, address _accountAddress) external
    {
        require(!initialized, "Pool already initialized !");
        
        owner = _owner;
        token = _token;
        poolName = _poolName;
        targetPrice = _targetPrice;
        accountAddress = _accountAddress;
    }

    function verify(bytes32 _messageHash, uint8 v, bytes32 r, bytes32 s) external view returns(bool) 
    {
        return ecrecover(_messageHash, v, r, s) == accountAddress;
    }
}