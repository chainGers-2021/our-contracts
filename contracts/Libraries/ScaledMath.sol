// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";

library ScaledMath 
{
    using SafeMath for uint256;

    function realToScaled(
        uint256 _realAmount,
        uint256 _reserveNormalizedIncome
    ) 
        external 
        pure 
        returns (uint256) 
    {
        return (_realAmount.mul(10**27)).div(_reserveNormalizedIncome);
    }

    function scaledToReal(
        uint256 _scaledAmount,
        uint256 _reserveNormalizedIncome
    )
        external
        pure
        returns (uint256)
    {
        return (_scaledAmount.mul(_reserveNormalizedIncome)).div(10**27);
    }
}
