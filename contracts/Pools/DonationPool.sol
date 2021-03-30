// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import "../Interfaces/IPools.sol";
import {Datatypes} from "../Utils/Datatypes.sol";

/***
 * Donation pool for charities/NGOs to withdraw donations
 * @author Chinmay Vemuri
 */
contract DonationPool is Ownable {
    using Datatypes for *;
    using SafeMath for uint256;

    struct Recipient {
        string organisationName;
        bool active;
        uint256 latestWithdrawalTimestamp;
    }

    address comptrollerContract;
    uint256 constant DONATION_FEE = 100; // Represents basis points
    mapping(address => Recipient) public recipients;
    mapping(string => uint256) public donationAmount;

    event newDonation(
        uint256 _donationAmount,
        string indexed _tokenSymbol,
        uint256 _timestamp
    );

    modifier onlyComptroller {
        require(msg.sender == comptrollerContract, "Unauthorized access");
        _;
    }

    function setComptroller(address _comptrollerAddress) external onlyOwner {
        comptrollerContract = _comptrollerAddress;
    }

    function donate(uint256 _amount, string calldata _tokenSymbol)
        external
        returns (uint256)
    {
        uint256 collectionAmount = (_amount.mul(DONATION_FEE)).div(10**4);

        donationAmount[_tokenSymbol] = donationAmount[_tokenSymbol].add(
            collectionAmount
        );

        emit newDonation(collectionAmount, _tokenSymbol, block.timestamp);
        return collectionAmount;
    }
}
