// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

library Datatypes {
    struct TokenData {
        string symbol;
        address token;
        address aToken;
        address priceFeed;
        uint8 decimals;
    }

    struct Pools {
        string poolName;
        string symbol;
        bool active;
        bool typePrivate;
        address owner;
        address accountAddress;
        uint256 targetPrice;
        uint256 poolScaledAmount;
        uint256 rewardScaledAmount;
        mapping(address => bool) verified;
        mapping(bytes => bool) signatures;
        mapping(address => uint256) userScaledDeposits;
    }
}
