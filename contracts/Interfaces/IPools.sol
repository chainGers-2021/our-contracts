//SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

interface IPools {
    event newTokenAdded(string _symbol, address _token, address _aToken);
    event newPoolCreated(
        string indexed _poolName,
        address indexed _owner,
        string symbol,
        uint256 _targetPrice,
        uint256 _timeStamp
    );
    event verified(
        string indexed _poolName,
        address _sender,
        uint256 _timeStamp
    );
    event newDeposit(
        string indexed _poolName,
        address indexed _sender,
        uint256 _amount,
        uint256 _timeStamp
    );
    event totalUserScaledDeposit(
        string indexed _poolName,
        address indexed _sender,
        uint256 _amount,
        uint256 _timestamp
    );
    event totalPoolScaledDeposit(
        string indexed _poolName,
        uint256 _amount,
        uint256 _timestamp
    );
    event newWithdrawal(
        string indexed _poolName,
        address indexed _sender,
        uint256 _amount,
        uint256 _timeStamp
    );

    function createPool(
        string calldata _symbol,
        string calldata _poolName,
        uint256 _targetPrice,
        address _accountAddress
    ) external;

    function deposit(
        string calldata _poolName,
        uint256 _amount,
        string calldata _tokenSymbol
    ) external;

    function withdraw(string calldata _poolName, uint256 _amount) external;
}