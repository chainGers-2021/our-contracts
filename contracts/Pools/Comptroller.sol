// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import { ILendingPool, ILendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import '@aave/protocol-v2/contracts/interfaces/IScaledBalanceToken.sol';
import { Datatypes } from '../Libraries/Datatypes.sol';
import './DonationPools.sol';
import '../Factory/PrivatePools.sol';
import '../Factory/PublicPools.sol';


contract Comptroller is Ownable
{
	using Datatypes for *;
	using SafeMath for uint256;

	address public donationPoolContract;
	address public privatePoolsContract;
	address lendingPoolAddressProvider = 0x88757f2f99175387aB4C6a4b3067c77A695b0349;
	mapping(string => Datatypes.TokenData) public tokenData;

    event newTokenAdded(string _symbol, address _token, address _aToken);

    constructor(address _donationPoolContract, address _privatePoolsContract)
        public
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
    ) external onlyOwner {
        require(
            keccak256(abi.encode(tokenData[_symbol].symbol)) !=
                keccak256(abi.encode(_symbol)),
            "Token data already present !"
        );

        Datatypes.TokenData memory newTokenData;

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
    ) external {
        Datatypes.TokenData memory poolTokenData = tokenData[_tokenSymbol];
        IERC20 token = IERC20(poolTokenData.token);
        address lendingPool =
            ILendingPoolAddressesProvider(lendingPoolAddressProvider)
                .getLendingPool();

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
        require(token.approve(lendingPool, _amount), "Approval failed !");

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
			_tokenSymbol,
			msg.sender
		);
	}

	function withdrawERC20(
		string calldata _poolName, 
		uint256 _amount,
		bool _typePrivate // If false => PublicPool and if true => PrivatePool
	) external
	{
		string memory tokenSymbol;
		bool penalty;
		uint256 withdrawalAmount;

		if(_typePrivate)
		{
			withdrawalAmount = PrivatePools(privatePoolsContract).withdraw(
				_poolName, 
				_amount,
				msg.sender
			);
			(,tokenSymbol,penalty,,,,,) = PrivatePools(privatePoolsContract).poolNames(_poolName);
		}
		else
		{
			withdrawalAmount = PublicPools(privatePoolsContract).withdraw(
				_poolName, 
				_amount,
				msg.sender
			);
			(,tokenSymbol,penalty,,,,,) = PublicPools(privatePoolsContract).poolNames(_poolName);
		}
		
        Datatypes.TokenData memory poolTokenData = tokenData[tokenSymbol];
		address lendingPool = ILendingPoolAddressesProvider(lendingPoolAddressProvider).getLendingPool();
        uint256 reserveNormalizedIncome = ILendingPool(lendingPool).getReserveNormalizedIncome(poolTokenData.token);
		
		// If target price of the pool wasn't achieved, take out the donation amount too.
		if(penalty)
		{
			uint256 donationAmount = DonationPools(donationPoolContract).donate(
				withdrawalAmount,
				tokenSymbol
			);
			withdrawalAmount = withdrawalAmount.sub(donationAmount);
		}
		
		// Till now withdrawalAmount was scaled down.
		withdrawalAmount = (withdrawalAmount.mul(reserveNormalizedIncome)).div(10**27);

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
		uint256 withdrawalAmount = DonationPools(donationPoolContract).withdraw(msg.sender, _tokenSymbol);
		uint256 reserveNormalizedIncome = ILendingPool(lendingPool).getReserveNormalizedIncome(poolTokenData.token);
	
		withdrawalAmount = (withdrawalAmount.mul(reserveNormalizedIncome)).div(
            10**27
        );

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
