// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import { ILendingPool, ILendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import { Datatypes } from '../Libraries/Datatypes.sol';
import { ScaledMath } from '../Libraries/ScaledMath.sol';
import './DonationPools.sol';
import './Pools.sol';


contract Comptroller is Ownable
{
	using Datatypes for *;
	using SafeMath for uint256;
    using ScaledMath for uint256;

	address public donationPoolsContract;
	address public poolsContract;
	address lendingPoolAddressProvider = 0x88757f2f99175387aB4C6a4b3067c77A695b0349;
	mapping(string => Datatypes.TokenData) public tokenData;

    event newTokenAdded(string _symbol, address _token, address _aToken);

    function setPoolAddresses(
        address _poolsContract,
        address _donationPoolsContract
    ) external onlyOwner 
    {
        poolsContract = _poolsContract;
        donationPoolsContract = _donationPoolsContract;
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

        Datatypes.TokenData storage newTokenData = tokenData[_symbol];

        newTokenData.symbol = _symbol;
        newTokenData.token = _token;
        newTokenData.aToken = _aToken;
        newTokenData.priceFeed = _priceFeed;
        newTokenData.decimals = _decimals;

        emit newTokenAdded(_symbol, _token, _aToken);
    }

    function depositERC20(
        string calldata _poolName,
        uint256 _amount
    ) external 
    {
        string memory tokenSymbol;

        (,tokenSymbol,,,,,,,) = Pools(poolsContract).poolNames(_poolName);

        Datatypes.TokenData memory poolTokenData = tokenData[tokenSymbol];
        IERC20 token = IERC20(poolTokenData.token);
        address lendingPool = ILendingPoolAddressesProvider(lendingPoolAddressProvider).getLendingPool();

        // Checking if user has allowed this contract to spend
        require(
            _amount <= token.allowance(msg.sender, address(this)),
            "Amount exceeds allowance limit !"
        );
        // Transfering tokens into this account
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Unable to transfer tokens to comptroller !"
        );
        // Transfering into Lending Pool
        require(
            token.approve(lendingPool, _amount), 
            "Approval failed !"
        );

        ILendingPool(lendingPool).deposit(
            poolTokenData.token,
            _amount,
            address(this),
            0
        );

		uint256 newScaledDeposit = _amount.realToScaled(getReserveIncome(tokenSymbol));

		uint256 donationAmount = DonationPools(donationPoolsContract).donate(
			newScaledDeposit,
			tokenSymbol
		);

        Pools(poolsContract).deposit(
                _poolName,
                newScaledDeposit.sub(donationAmount),
                msg.sender
        );
	}

	function withdrawERC20(
		string calldata _poolName, 
		uint256 _amount 
	) external
	{
		string memory tokenSymbol;
		bool penalty;
        uint256 withdrawalAmount;
        
		
        withdrawalAmount = Pools(poolsContract).withdraw(
            _poolName, 
            _amount,
            msg.sender
        );
        (,tokenSymbol,penalty,,,,,,) = Pools(poolsContract).poolNames(_poolName);
		
		
        Datatypes.TokenData memory poolTokenData = tokenData[tokenSymbol];
		address lendingPool = ILendingPoolAddressesProvider(lendingPoolAddressProvider).getLendingPool();
        
		// If target price of the pool wasn't achieved, take out the donation amount too.
		if(penalty)
		{
			uint256 donationAmount = DonationPools(donationPoolsContract).donate(
				withdrawalAmount,
				tokenSymbol
			);
			withdrawalAmount = withdrawalAmount.sub(donationAmount);
		}
		
		// Till now withdrawalAmount was scaled down.
        withdrawalAmount = withdrawalAmount.scaledToReal(getReserveIncome(tokenSymbol));

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

	// This function is for the Recipients (NGOs)
	function withdrawDonation(string calldata _tokenSymbol) external
	{
		Datatypes.TokenData memory poolTokenData = tokenData[_tokenSymbol];
		address lendingPool = ILendingPoolAddressesProvider(lendingPoolAddressProvider).getLendingPool();
		uint256 withdrawalAmount = DonationPools(donationPoolsContract).withdraw(msg.sender, _tokenSymbol);
	
		withdrawalAmount = withdrawalAmount.scaledToReal(getReserveIncome(_tokenSymbol));

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

    function getReserveIncome(string memory _symbol) public view returns(uint256)
    {
        address lendingPool = ILendingPoolAddressesProvider(lendingPoolAddressProvider).getLendingPool();

        return ILendingPool(lendingPool).getReserveNormalizedIncome(tokenData[_symbol].token);
    }
}
