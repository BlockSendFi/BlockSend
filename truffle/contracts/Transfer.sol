// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IFixedRateWrapper.sol";
import "./interfaces/ISynthereum.sol";
import "./interfaces/IERC20.sol";

contract Transfer is Ownable{
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

    // mapping(address => uint) public balanceReceived;
    
    mapping (uint => Remittance) public transfers;
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

    event TransferInitilized(uint remittanceId, uint amount);
    event TransferStatusChanged(uint remittanceId, TransferStatus currentStatus, string errorMsg);
    event TransferFinalized(uint remittanceId);

    constructor() {
        jarvisWrapper = IFixedRateWrapper(WRAPPER_CONTRACT);
        jarvisSynthereum = ISynthereum(SYNTHEREUM_CONTRACT);
        moneriumEURemoney = IERC20(EURE_TOKEN_CONTRACT);
        jEURToken = IERC20(JEUR_TOKEN_CONTRACT);
        uSDCToken = IERC20(USDC_TOKEN_CONTRACT);
    }

    /**
     * @notice Iinitialise a transfer of an amount of EURe
     * @notice First Step: On-Ramp: 
     * @notice 1- Transfer EURe from user's wallet
     * @notice 2- Wrap EURe to jEUR
     * @notice 3- Redeem USDC from jEUR
     * @notice Secod Step: Off-Ramp: Using HUB2
     * @param remittanceId Input parameters for redeeming (see RedeemParams struct)
     * @param amount Input parameters for redeeming (see RedeemParams struct)
     * @return ok a boolean value indicating whether the operation succeeded.
     * 
     * Emits a {TransferStatusChanged} event with the current status of the transfer.
     */
    function initializeTransfer(uint remittanceId, uint256 amount) external returns (bool ok) {

        initilizeTransfer(remittanceId, amount);

        bool okGetEURe = transferFrom(remittanceId, amount);
        if(!okGetEURe){
            TransferStuck(remittanceId, "");
            return false;
        }
        
        bool okApproveWrap = approveWrap(amount);
        if(!okApproveWrap){
            TransferStuck(remittanceId, "");
            return false;
        }

        uint256 amountJEUR = routage_jEURfromEURe(remittanceId, amount);
        if(amountJEUR==0){
            TransferStuck(remittanceId, "");
            return false;
        }
        
        bool okApproveRedeem = approveRedeem(amount);
        if(!okApproveRedeem){
            TransferStuck(remittanceId, "");
            return false;
        }

        (uint256 collateralRedeemed, uint256 feePaid) = routage_USDCfromjEUR(remittanceId, amountJEUR, amountJEUR);
        if(collateralRedeemed==0){
            TransferStuck(remittanceId, "");
            return false;
        }

        bool okTransferToHub2Wallet = transferToHUB2Wallet(remittanceId, collateralRedeemed);
        if(!okTransferToHub2Wallet){
            TransferStuck(remittanceId, "");
            return false;
        }

        finalizeTransfer(remittanceId);

        return true;
    }

    /**
     * Returns the current status of a specific remmitance.
     */
    function remittanceStatus(uint remittanceId) public view virtual returns (TransferStatus) {
        return transfers[remittanceId].status;
    }

    // *********************** Manage Status changed ************************************
    function initilizeTransfer(uint remittanceId, uint amount) internal{
        transfers[remittanceId].sender=msg.sender;
        transfers[remittanceId].amount=amount;
        transfers[remittanceId].status=TransferStatus.INITIALIZED;
        
        emit TransferStatusChanged(remittanceId, TransferStatus.INITIALIZED, "");
    }

    function finalizeTransfer(uint remittanceId) internal{
        transfers[remittanceId].status=TransferStatus.FINALIZED;
        
        emit TransferStatusChanged(remittanceId, TransferStatus.FINALIZED, "");
    }

    function StatusChanged(uint remittanceId, TransferStatus status) internal{
        transfers[remittanceId].status=status;
        
        emit TransferStatusChanged(remittanceId, status, "");
    }

    function TransferStuck(uint remittanceId, string memory errorMsg) internal{
        transfers[remittanceId].status=TransferStatus.TRANSFER_STUCKED;
        
        emit TransferStatusChanged(remittanceId, TransferStatus.TRANSFER_STUCKED, errorMsg);
    }
    // *********************************************************************************


    // *********************** GET EURe from user's wallet *****************************
    function approveTransferEURe(uint256 amount) external returns (bool ok){
        ok = moneriumEURemoney.approve(address(this), amount);
    }

    function transferFrom(uint remittanceId, uint256 amount) internal returns (bool ok){
        ok = moneriumEURemoney.transferFrom(msg.sender, address(this), amount);

        StatusChanged(remittanceId, TransferStatus.EURE_RECEIVED);
    }
    // *********************************************************************************
    

    // *********************** Wrap EURe to JEUR ***************************************
    function approveWrap(uint256 amount) internal returns (bool ok){
        ok = moneriumEURemoney.approve(WRAPPER_CONTRACT, amount);
    }

    function routage_jEURfromEURe(uint remittanceId, uint256 _collateral) internal returns(uint256 amountTokens){
        amountTokens = jarvisWrapper.wrap(_collateral, address(this));

        StatusChanged(remittanceId, TransferStatus.JEUR_WRAPPED);
    }
    // *********************************************************************************
    

    // *********************** Wurn & Mint (Redeem) UCDS from JEUR *********************
    function approveRedeem(uint256 amount) internal returns (bool ok){
        ok = jEURToken.approve(SYNTHEREUM_CONTRACT, amount);
    }

    function routage_USDCfromjEUR(uint remittanceId, 
                                    uint256 _numToken, 
                                    uint256 _minCollateral) 
                internal returns (uint256 collateralRedeemed, uint256 feePaid){
        
        ISynthereum.RedeemParams memory params =
            ISynthereum.RedeemParams({
                numTokens: _numToken,
                minCollateral: _minCollateral,
                expiration: block.timestamp,
                recipient: HUB2_WALLET
            });
 
        (collateralRedeemed, feePaid) = jarvisSynthereum.redeem(params);
        
        StatusChanged(remittanceId, TransferStatus.USDC_RECEIVED);
    }
    // *********************************************************************************
    

    // *********************** Transfer USDC to HUB2 Wallet ****************************
    function transferToHUB2Wallet(uint remittanceId, uint256 amount) internal returns ( bool ok ){
        ok = uSDCToken.transfer(HUB2_WALLET, amount);

        StatusChanged(remittanceId, TransferStatus.USDC_SENT);
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
    // *********************************************************************************
    

    // receive() external payable {
    //     assert(balanceReceived[msg.sender] + msg.value >= balanceReceived[msg.sender]);
    //     balanceReceived[msg.sender] += msg.value;
    // }
}