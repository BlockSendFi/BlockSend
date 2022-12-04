// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ISynthereum {

    struct RedeemParams {
      // Amount of synthetic tokens that user wants to use for redeeming
      uint256 numTokens;
      // Minimium amount of collateral that user wants to redeem (anti-slippage)
      uint256 minCollateral;
      // Expiration time of the transaction
      uint256 expiration;
      // Address to which send collateral tokens redeemed
      address recipient;
    }

    /**
     * @notice Redeem amount of collateral using fixed number of synthetic token
     * @notice This calculate the price using on chain price feed
     * @notice User must approve synthetic token transfer for the redeem request to succeed
     * @param _redeemParams Input parameters for redeeming (see RedeemParams struct)
     * @return collateralRedeemed Amount of collateral redeeem by user
     * @return feePaid Amount of collateral paid by user as fee
     */
    function redeem (RedeemParams memory _redeemParams ) external returns ( uint256, uint256 );
}