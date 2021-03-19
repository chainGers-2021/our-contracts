// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

contract Verification
{
    address public accountAddress;
    mapping(bytes32 => bool) public signs;
    mapping(address => bool) public verified;

    event unauthorizedAccess(address _sender);
    event authorizedAccess(address _sender);

    constructor(address _accountAddress) public
    {
        accountAddress = _accountAddress;
    }

    function verify(bytes32 _hash, uint8 v, bytes32 r, bytes32 s) external
    {
        require(!signs[_hash], "Unauthorized access: Reusing signature");
        if(ecrecover(_hash, v, r, s) == accountAddress)
        {
            signs[_hash] = true;
            verified[msg.sender] = true;

            emit authorizedAccess(msg.sender);
        }

        else
            emit unauthorizedAccess(msg.sender);
    }
}