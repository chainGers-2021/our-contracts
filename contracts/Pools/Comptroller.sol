// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {
    ILendingPool
} from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import "@aave/protocol-v2/contracts/interfaces/IScaledBalanceToken.sol";

contract Comptroller {
    function deposit(
        uint256 _amount,
        address _token,
        address _pool
    ) external {
        ERC20 token = ERC20(_token);
        // Checking if user has allowed this contract to spend
        require(_amount <= token.allowance(msg.sender, address(this)));
        // Transfering tokens into this account
        require(token.transferFrom(msg.sender, address(this), _amount) == true);
        // Transfering into Lending Pool

        token.approve(_pool, _amount);
        ILendingPool(_pool).deposit(_token, _amount, address(this), 0);
    }

    // function withdraw(uint256 amount, address tokenAddr, address pool, address aTokenAddr)external payable{
    // 	// Direct withdraw into user account
    // 	ERC20(aTokenAddr).approve(pool, amount);
    // 	ILendingPool(pool).withdraw(tokenAddr, type(uint).max, msg.sender);
    // }

    // function myfun(address aTokenAddr)public view returns(uint256, uint256, uint256){
    // 	uint256 val1;
    // 	uint256 val2;
    // 	(val1, val2) =	IScaledBalanceToken(aTokenAddr).getScaledUserBalanceAndSupply(address(this));

    // 	return (
    // 		IScaledBalanceToken(aTokenAddr).scaledBalanceOf(address(this)),
    // 		val1, val2
    // 	);
    // }
}
