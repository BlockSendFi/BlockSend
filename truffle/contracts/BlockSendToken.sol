// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "../node_modules/@openzeppelin/contracts/security/Pausable.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract BlockSendToken is
    ERC20,
    ERC20Burnable,
    Pausable,
    Ownable,
    ERC20Permit
{
    address private minter;

    constructor()
        ERC20("BlockSendToken", "BKSD")
        ERC20Permit("BlockSendToken")
    {}

    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter can mint");
        _;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setMinter(address _minter) public onlyOwner {
        minter = _minter;
    }

    function mint(address to, uint256 amount) public onlyMinter {
        _mint(to, amount);
    }
}
