// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/***
 * Donation pool for charities/NGOs to withdraw donations
 * @author Chinmay Vemuri
 */
contract DonationPool is Ownable {
    mapping(address => bool) public recipients;
    // mapping()
}
