// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Blueberry is ERC20{
    address mainMinter;
    constructor (
        string memory _name, 
        string memory _symbol, 
        address _mainMinter
    ) ERC20(_name, _symbol) public{
        mainMinter = _mainMinter;
    }

    modifier onlyOwner{
      require(msg.sender == mainMinter);
      _;
    }

    function mint(address account, uint amount)onlyOwner external{
        _mint(account, amount);
    }

    function burn(address account, uint amount)onlyOwner external{
        require(account == mainMinter);
        _burn(account, amount);
    }
}