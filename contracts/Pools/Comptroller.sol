// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "@openzeppelin/contracts/access/Ownable.sol";
import { ILendingPool, ILendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import '@aave/protocol-v2/contracts/interfaces/IScaledBalanceToken.sol';
import '../Factory/PrivatePools.sol';
import { Datatypes } from '../Utils/Datatypes.sol';

contract Comptroller is Ownable
{
	using DataTypes for *;

	address public donationPoolContract;
	address public privatePoolsContract;
	mapping(string => Datatypes.TokenData) tokenData;

	event newTokenAdded(string _symbol, address _token, address _aToken);

	constructor(address _donationPoolContract, address _privatePoolsContract) public
	{
		donationPoolContract = _donationPoolContract;
		privatePoolsContract = _privatePoolsContract;
	}

	function addTokenData(
        string calldata _symbol,
        address _token, 
        address _aToken, 
        address _priceFeed,
        uint8 _decimals
    ) external onlyOwner
    {
        require(
            keccak256(abi.encode(tokenData[_symbol].symbol)) != keccak256(abi.encode(_symbol)), 
            "Token data already present !"
        );

        TokenData memory newTokenData;

        newTokenData.symbol = _symbol;
        newTokenData.token = _token;
        newTokenData.aToken = _aToken;
        newTokenData.priceFeed = _priceFeed;
        newTokenData.decimals = _decimals;
        tokenData[_symbol] = newTokenData;

        emit newTokenAdded(_symbol, _token, _aToken);
    }

	function depositERC20(
		string calldata _poolName, 
		uint256 _amount, 
		string calldata _tokenSymbol
	) external 
	{
		IERC20 token = IERC20(_token);
		Datatypes.TokenData storage poolTokenData = tokenData[_tokenSymbol];
		address lendingPool = ILendingPoolAddressesProvider(lendingPoolAddressProvider).getLendingPool();

		// Checking if user has allowed this contract to spend
		require(
            _amount <= poolTokenData.token.allowance(msg.sender, address(this)),
            "Amount exceeds allowance limit !"
        );
		// Transfering tokens into this account
		require(
            poolTokenData.token.transferFrom(msg.sender, address(this), _amount),
            "Unable to transfer tokens to comptroller !"
        );
		// Transfering into Lending Pool
		require(
            poolToken.token.approve(lendingPool, _amount), 
            "Approval failed !"
        );
		
		ILendingPool(lendingPool).deposit(
            poolTokenData.token,
            _amount,
            address(this),
            0
        );

        uint256 reserveNormalizedIncome = ILendingPool(lendingPool).getReserveNormalizedIncome(poolTokenData.token);
		uint256 newScaledDeposit = (_amount.mul(10**27)).div(reserveNormalizedIncome);

		uint256 donationAmount = DonationPools(donationPoolContract).donate(
			newScaledDeposit,
			_tokenSymbol
		);

		PrivatePools(privatePoolsContract).deposit(
			_poolName,
			newScaledDeposit.sub(donationAmount),
			_tokenSymbol
		);
	}

	function withdrawERC20(
		string calldata _poolName, 
		uint256 _amount
	) external
	{
		Datatypes.Pool memory tokenSymbol = PrivatePools(privatePoolsContract).poolNames[_poolName].symbol;
        Datatypes.TokenData storage poolTokenData = tokenData[tokenSymbol];
		address lendingPool = ILendingPoolAddressesProvider(lendingPoolAddressProvider).getLendingPool();
        uint256 reserveNormalizedIncome = ILendingPool(lendingPool).getReserveNormalizedIncome(poolTokenData.token);
		
        (uint256 withdrawalAmount, bool penalty) = PrivatePools(privatePoolsContract).withdraw(
			_poolName, 
			(_amount.mul(10**27)).div(reserveNormalizedIncome)
		);
		
		// If target price of the pool wasn't achieved, take out the donation amount too.
		if(penalty)
		{
			uint256 donationAmount = DonationPools(donationPoolContract).donate(
				withdrawalAmount,
				tokenSymbol
			);

			withdrawalAmount = withdrawalAmount.sub(donationAmount);
		}
		
		// Approving aToken pool
        require(
            IERC20(poolTokenData.aToken).approve(lendingPool, withdrawalAmount),
            "aToken approval failed !"
        );

		// Redeeming the aTokens
        ILendingPool(lendingPool).withdraw(
            poolTokenData.token, 
            withdrawalAmount, 
            msg.sender
        );
	}
	
}