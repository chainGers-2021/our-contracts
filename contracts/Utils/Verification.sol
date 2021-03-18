// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

contract Verification
{
    address public accountAddress;

    constructor(address _accountAddress) public
    {
        accountAddress = _accountAddress;
    }

    function verify(bytes32 hash, uint8 v, bytes32 r, bytes32 s) external view returns(bool) 
    {
        return ecrecover(hash, v, r, s) == accountAddress;
    }
}