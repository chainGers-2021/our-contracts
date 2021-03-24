pragma solidity ^0.7.6;


contract Factory
{
    struct Pools
    {
        mapping(address => bool) sender;
    }
    
    mapping(uint => Pools) poolId;
    uint8 public id = 0;
    
    constructor()
    {
        Pools storage newPool = poolId[id++];
        
        newPool.sender[msg.sender] = true;
        
    }
    
    function getDetails() external view returns(bool)
    {
        return poolId[id - 1].sender[msg.sender];
    }
}
    