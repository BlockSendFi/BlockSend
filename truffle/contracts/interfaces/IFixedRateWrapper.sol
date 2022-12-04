// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IFixedRateWrapper {
    /** 
     * @notice This function is used to mint new fixed rate synthetic tokens by depositing peg collateral tokens
     * @notice The conversion is based on a fixed rate
     * @param _collateral The amount of peg collateral tokens to be deposited
     * @param _recipient The address of the recipient to receive the newly minted fixed rate synthetic tokens
     * @return amountTokens The amount of newly minted fixed rate synthetic tokens
    */
   function wrap(uint256 _collateral, address _recipient) external returns (uint256 amountTokens);
}