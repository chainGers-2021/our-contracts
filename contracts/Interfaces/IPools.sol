//SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import {Datatypes} from "../Libraries/Datatypes.sol";

interface IPools {
    event newPoolCreated(
        string _poolName,
        address indexed _owner,
        string symbol,
        uint256 _targetPrice,
        uint256 _timestamp
    );
    event verified(
        string  _poolName,
        address _sender,
        uint256 _timestamp
    );
    event newDeposit(
        string _poolName,
        address _sender,
        uint256 _amount,
        uint256 _timestamp
    );
    event totalPoolDeposit(
        string _poolName,
        uint256 _amount,
        uint256 _timestamp
    );
    event totalUserScaledDeposit(
        string _poolName,
        address indexed _sender,
        uint256 _amount,
        uint256 _timestamp
    );
    event totalPoolScaledDeposit(
        string _poolName,
        uint256 _amount,
        uint256 _timestamp
    );
    event newWithdrawal(
        string _poolName,
        address indexed _sender,
        uint256 _amount,
        uint256 _timestamp
    );

    // function createPool(
    //     string calldata _symbol,
    //     string calldata _poolName,
    //     uint256 _targetPrice,
    //     address _poolAccountAddress
    // ) external;

    function deposit(
        string calldata _poolName,
        uint256 _amount,
        string calldata _tokenSymbol,
        address _sender
    ) external;

    function withdraw(
        string calldata _poolName,
        uint256 _amount,
        address _sender
    ) external returns (uint256);
}
