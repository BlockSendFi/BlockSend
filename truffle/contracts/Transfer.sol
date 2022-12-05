// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IFixedRateWrapper.sol";
import "./interfaces/ISynthereum.sol";

contract Transfer is Ownable{

    AggregatorV3Interface internal priceFeed;

    IFixedRateWrapper public  jarvisWrapper;
    ISynthereum public jarvisSynthereum;

    IERC20 public moneriumEURemoney;
    IERC20 public jEURToken;
    IERC20 public uSDCToken;

    address private WRAPPER_CONTRACT = 0x2e0644F5F4cba24e610A6d94FC146d97b63920e1;
    address private SYNTHEREUM_CONTRACT = 0x6FB13EA630D08e0d34Ea7948Ab2d7398Dd9F41af;
    address private EURE_TOKEN_CONTRACT = 0xecdF72dFa3f51AF61740Fd14bAdCa1947Bef657B;
    address private JEUR_TOKEN_CONTRACT = 0xEf9cbDbC2e396a01D7658AdEc548C1211b443642;
    address private USDC_TOKEN_CONTRACT = 0x5425890298aed601595a70AB815c96711a31Bc65;
    address private HUB2_WALLET = 0x64568cfc9122104a4B23ABf67830873BE66Fc3D8;
    address private EUR_USD_AGGREGATOR = 0x73366Fe0AA0Ded304479862808e02506FE556a98;
    address private BLOCKSEND_WALLET = 0x64568cfc9122104a4B23ABf67830873BE66Fc3D8;

    // mapping(address => uint) public balanceReceived;
    
    mapping (string => Remittance) public transfers;
    struct Remittance {
        address sender;
        uint amount;
        TransferStatus status;
    }
    enum TransferStatus {
        INITIALIZED,
        EURE_RECEIVED,
        JEUR_WRAPPED,
        USDC_RECEIVED,
        USDC_SENT,
        FINALIZED,
        TRANSFER_STUCKED
    }

    event TransferInitilized(string transferId, uint amount);
    event TransferStatusChanged(string transferId, TransferStatus currentStatus, string errorMsg);
    event TransferFinalized(string transferId, string tx);

    constructor() {
        jarvisWrapper = IFixedRateWrapper(WRAPPER_CONTRACT);
        jarvisSynthereum = ISynthereum(SYNTHEREUM_CONTRACT);
        moneriumEURemoney = IERC20(EURE_TOKEN_CONTRACT);
        jEURToken = IERC20(JEUR_TOKEN_CONTRACT);
        uSDCToken = IERC20(USDC_TOKEN_CONTRACT);
        priceFeed = AggregatorV3Interface(EUR_USD_AGGREGATOR);
    }

    /**
     * @notice Iinitialise a transfer of an amount of EURe
     * @notice First Step: On-Ramp: 
     * @notice 1- Transfer EURe from user's wallet
     * @notice 2- Wrap EURe to jEUR
     * @notice 3- Get jEUR/USDC Rate
     * @notice 4- Redeem USDC from jEUR
     * @notice Secod Step: Off-Ramp: Using HUB2
     * @param transferId Input parameters for redeeming (see RedeemParams struct)
     * @param amount Input parameters for redeeming (see RedeemParams struct)
     * @return ok a boolean value indicating whether the operation succeeded.
     * 
     * Emits a {TransferStatusChanged} event with the current status of the transfer.
     */
    function initializeTransfer(string calldata transferId, address userWallet, uint256 amount) external returns (bool ok) {

        initilizeTransferData(transferId, amount);

        bool okGetEURe = transferFrom(transferId, userWallet, amount);
        if(!okGetEURe){
            TransferStuck(transferId, "");
            return false;
        }

        (bool okApproveWrap, uint256 amountJEUR) = routage_jEURfromEURe(transferId, amount, amount);
        if(okApproveWrap && amountJEUR==0){
            TransferStuck(transferId, "");
            return false;
        }

        uint price = getLatestPrice();        
        uint collateralUSDC = (amountJEUR/10e8)*price; 

        (bool okApprouveJEUR, bool okApprouveUSDC, uint256 collateralRedeemed, uint256 feePaid) = routage_USDCfromjEUR(transferId, amountJEUR, collateralUSDC);
        if(okApprouveJEUR && okApprouveUSDC && collateralRedeemed==0 && feePaid==0){
            TransferStuck(transferId, "");
            return false;
        }

        bool okTransferToHub2Wallet = transferToHUB2Wallet(transferId, collateralRedeemed);
        if(!okTransferToHub2Wallet){
            TransferStuck(transferId, "");
            return false;
        }

        finalizeTransfer(transferId, "");

        return true;
    }

    /**
     * Returns the current status of a specific remmitance.
     */
    function remittanceStatus(string calldata transferId) public view virtual returns (TransferStatus) {
        return transfers[transferId].status;
    }

    // *********************** Manage Status changed ************************************
    function initilizeTransferData(string calldata transferId, uint amount) internal{
        transfers[transferId].sender=msg.sender;
        transfers[transferId].amount=amount;
        transfers[transferId].status=TransferStatus.INITIALIZED;
        
        emit TransferInitilized(transferId, amount);
    }

    function finalizeTransfer(string calldata transferId, string memory transactionCode) internal{
        transfers[transferId].status=TransferStatus.FINALIZED;
        
        emit TransferFinalized(transferId, transactionCode);
    }

    function StatusChanged(string calldata transferId, TransferStatus status) internal{
        transfers[transferId].status=status;
        
        emit TransferStatusChanged(transferId, status, "");
    }

    function TransferStuck(string calldata transferId, string memory errorMsg) internal{
        transfers[transferId].status=TransferStatus.TRANSFER_STUCKED;
        
        emit TransferStatusChanged(transferId, TransferStatus.TRANSFER_STUCKED, errorMsg);
    }
    // *********************************************************************************


    // *********************** GET EURe from user's wallet *****************************
    function approveTransferEURe(address userWallet, uint256 amount) external returns (bool ok){
        ok = moneriumEURemoney.approve(userWallet, amount);
    }

    function transferFrom(string calldata transferId, address userWallet, uint256 amount) internal returns (bool ok){
        ok = moneriumEURemoney.transferFrom(userWallet, BLOCKSEND_WALLET, amount);

        StatusChanged(transferId, TransferStatus.EURE_RECEIVED);
    }
    // *********************************************************************************
    

    // *********************** Wrap EURe to JEUR ***************************************
    function routage_jEURfromEURe(string calldata transferId, uint256 amount, uint256 collateral) internal returns(bool ok, uint256 amountTokens){
        
        ok = moneriumEURemoney.approve(WRAPPER_CONTRACT, amount);
        amountTokens = jarvisWrapper.wrap(collateral, address(this));

        StatusChanged(transferId, TransferStatus.JEUR_WRAPPED);
    }
    // *********************************************************************************
    

    // *********************** Wurn & Mint (Redeem) UCDS from JEUR *********************
    function routage_USDCfromjEUR(string calldata transferId, 
                                    uint256 _numToken, 
                                    uint256 _minCollateral) 
                internal returns (bool okApprouveJEUR, bool okApprouveUSDC, uint256 collateralRedeemed, uint256 feePaid){
        
        okApprouveJEUR = jEURToken.approve(SYNTHEREUM_CONTRACT, _numToken);
        okApprouveUSDC = uSDCToken.approve(SYNTHEREUM_CONTRACT, _minCollateral);

        ISynthereum.RedeemParams memory params =
            ISynthereum.RedeemParams({
                numTokens: _numToken,
                minCollateral: _minCollateral,
                expiration: block.timestamp,
                recipient: HUB2_WALLET
            });
 
        (collateralRedeemed, feePaid) = jarvisSynthereum.redeem(params);
        
        StatusChanged(transferId, TransferStatus.USDC_RECEIVED);
    }
    // *********************************************************************************
    

    // *********************** Transfer USDC to HUB2 Wallet ****************************
    function transferToHUB2Wallet(string calldata transferId, uint256 amount) internal returns ( bool ok ){
        ok = uSDCToken.transfer(HUB2_WALLET, amount);

        StatusChanged(transferId, TransferStatus.USDC_SENT);
    }
    // *********************************************************************************


    // *********************** Update Contracts Addresses ******************************
    function setWrapperContract(address newAddress) external onlyOwner {
        WRAPPER_CONTRACT = newAddress;
    }

    function setSyntheriumContract(address newAddress) external onlyOwner {
        SYNTHEREUM_CONTRACT = newAddress;
    }

    function setEURETokenContract(address newAddress) external onlyOwner {
        EURE_TOKEN_CONTRACT = newAddress;
    }

    function setJEURToken_Contract(address newAddress) external onlyOwner {
        JEUR_TOKEN_CONTRACT = newAddress;
    }

    function setUSDCTokenContract(address newAddress) external onlyOwner {
        USDC_TOKEN_CONTRACT = newAddress;
    }

    function setHUB2Wallet(address newAddress) external onlyOwner {
        HUB2_WALLET = newAddress;
    }

    function setEUR_USD_Aggregator(address newAddress) external onlyOwner {
        EUR_USD_AGGREGATOR = newAddress;
    }

    function setBlockSend_Wallet(address newAddress) external onlyOwner {
        BLOCKSEND_WALLET = newAddress;
    }
    // *********************************************************************************


    // *********************** Get the latest rate *************************************
    function getLatestPrice() public view returns (uint) {
        (, int price , , ,) = priceFeed.latestRoundData();
        return uint(price/100);
    }
    // *********************************************************************************
}