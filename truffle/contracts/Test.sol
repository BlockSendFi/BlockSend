// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool ok);
}

contract Routage {
    IERC20 public monerium;
    address public constant MONERIUM_EUR_EMONEY_CONTRACT = 0xCF487EFd00B70EaC8C28C654356Fb0E387E66D62;

    constructor() {
        monerium = IERC20(MONERIUM_EUR_EMONEY_CONTRACT);
    }

    function Transfer(address spender, uint256 amount) external returns (bool okApprouve, bool okTransfer){
        okApprouve = monerium.approve(spender, amount);
        okTransfer = monerium.transferFrom(spender, address(this), amount);
    }
}