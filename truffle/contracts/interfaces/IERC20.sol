// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IERC20 {
    function transferFrom (address from, address to, uint256 amount) external returns ( bool ok );

    function approve(address spender, uint256 amount) external returns (bool ok);

    function transfer (address to, uint256 amount) external returns ( bool ok );

    function allowance ( address owner, address spender ) external view returns ( uint256 );
}