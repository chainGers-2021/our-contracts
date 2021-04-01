// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import "../Interfaces/IPools.sol";
import "./Comptroller.sol";

/***
 * Donation pool for charities/NGOs to withdraw donations
 * @author Chinmay Vemuri
 */
contract DonationPools is Ownable {
    using SafeMath for uint256;

    struct Recipient {
        string organisationName;
        bool active;
        mapping(string => uint256) latestWithdrawalTimestamp;
    }

    address comptrollerContract;
    uint256 constant DONATION_FEE = 100; // Represents basis points
    uint256 numRecipients;
    mapping(address => Recipient) public recipients;
    mapping(string => uint256) public donationAmount;

    event newDonation(
        uint256 _donationAmount,
        string indexed _tokenSymbol,
        uint256 _timestamp
    );
    event newRecipientAdded(
        address indexed _recipient,
        string indexed _organisationName,
        uint256 _timestamp
    );
    event recipientDeactivated(
        address indexed _recipient,
        string indexed _organisationName,
        uint256 _timestamp
    );
    event newDonationWithdrawal(
        address indexed _recipient,
        string indexed _organisationName,
        uint256 _timestamp
    );

    modifier onlyComptroller {
        require(
            msg.sender == comptrollerContract, 
            "Unauthorized access"
        );
        _;
    }

    constructor(address _comptrollerContract) public
    {
        comptrollerContract = _comptrollerContract;
    }

    // function setComptroller(address _comptrollerAddress) external onlyOwner {
    //     comptrollerContract = _comptrollerAddress;
    // }

    function addRecipient(address _recipient, string calldata _organisationName)
        external
        onlyOwner
    {
        Recipient storage newRecipient = recipients[_recipient];

        newRecipient.organisationName = _organisationName;
        newRecipient.active = false;

        emit newRecipientAdded(
            msg.sender,
            newRecipient.organisationName,
            block.timestamp
        );
    }

    function deactivateRecipient(address _recipient) external onlyOwner {
        recipients[_recipient].active = false;

        emit recipientDeactivated(
            _recipient,
            recipients[_recipient].organisationName,
            block.timestamp
        );
    }

    function donate(uint256 _amount, string calldata _tokenSymbol)
        external
        onlyComptroller
        returns (uint256)
    {
        uint256 collectionAmount = (_amount.mul(DONATION_FEE)).div(10**4);

        donationAmount[_tokenSymbol] = donationAmount[_tokenSymbol].add(
            collectionAmount
        );

        emit newDonation(collectionAmount, _tokenSymbol, block.timestamp);

        return collectionAmount;
    }

    function withdraw(address _recipient, string calldata _tokenSymbol)
        external
        onlyComptroller
        returns (uint256)
    {
        require(recipients[_recipient].active, "Invalid/Deactivated recipient");
        require(
            block.timestamp.sub(
                recipients[_recipient].latestWithdrawalTimestamp[_tokenSymbol]
            ) >= 4 weeks,
            "Donation share already redeemed"
        );

        uint256 withdrawalScaledAmount =
            donationAmount[_tokenSymbol].div(numRecipients);
        recipients[_recipient].latestWithdrawalTimestamp[_tokenSymbol] = block
            .timestamp;

        emit newDonationWithdrawal(
            msg.sender,
            recipients[_recipient].organisationName,
            block.timestamp
        );

        return withdrawalScaledAmount;
    }
}
