// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IFixedRateWrapper.sol";
import "./interfaces/ISynthereum.sol";

contract Transfer is Ownable{
    AggregatorV3Interface private priceFeed;

    IFixedRateWrapper private  jarvisWrapper;
    ISynthereum private jarvisSynthereum;
    IERC20 private moneriumEURemoney;
    IERC20 private jEURToken;
    IERC20 private uSDCToken;


    address private WRAPPER_CONTRACT = 0xb07Cb016440331be4D2f532b20d892a420476AD0;
    address private SYNTHEREUM_CONTRACT = 0x65a7b4Ff684C2d08c115D55a4B089bf4E92F5003;
    address private EURE_TOKEN_CONTRACT = 0x18ec0A6E18E5bc3784fDd3a3634b31245ab704F6;
    address private JEUR_TOKEN_CONTRACT = 0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c;
    address private USDC_TOKEN_CONTRACT = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    address private EUR_USD_AGGREGATOR = 0x73366Fe0AA0Ded304479862808e02506FE556a98;

    address private HUB2_WALLET = 0x64568cfc9122104a4B23ABf67830873BE66Fc3D8;
    address private BLOCKSEND_BACKEND = 0x913Cd67dA3b17be7f66E865158cDF9a5c4F2a850;
    address private BLOCKSEND_WALLET = 0x64568cfc9122104a4B23ABf67830873BE66Fc3D8;
    
    mapping (string => Remittance) public transfers;
    struct Remittance {
        address sender;
        uint amount_EURe;
        uint amount_jEUR;
        uint amount_USDC;
        TransferStatus status;
    }
    enum TransferStatus {
        INITIALIZED,
        EURE_RECEIVED,
        JEUR_WRAPPED,
        USDC_RECEIVED,
        USDC_SENT,
        FINALIZED,
        TRANSFER_STUCK
    }
    
    mapping (address => bool) private allowed;

    event TransferInitilized(string transferId, uint amount);
    event TransferStatusChanged(string transferId, TransferStatus currentStatus, string errorMsg);
    event TransferFinalized(string transferId, string tx);

    modifier onlyBlockSendBakend() {
        require(allowed[msg.sender], "You're allowed to initiate a transfer");
        _;
    }

    constructor() {
        allowed[BLOCKSEND_BACKEND] = true;
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
     * @notice 2- Wrap EURe to jEUR (Jarvis wrapper)
     * @notice 3- Get jEUR/USDC Rate (Aggregator Chainlink)
     * @notice 4- Redeem USDC from jEUR (Jarvis Redeem)
     * @notice Secod Step: Get the 2% of fees
     * @notice Third Step: Off-Ramp: Using HUB2
     * @notice if any error: Sent money to users wallet back
     * @param transferId Input parameters for redeeming (see RedeemParams struct)
     * @param amount Input parameters for redeeming (see RedeemParams struct)
     * @return ok a boolean value indicating whether the operation succeeded.
     * 
     * Emits a {TransferStatusChanged} event with the current status of the transfer.
     */
    function initializeTransfer(string calldata transferId, address userWallet, uint256 amount) external onlyBlockSendBakend returns (bool ok) {

        initilizeTransferData(transferId, amount);

        bool okGetEURe = transferFrom(transferId, userWallet, amount);
        if(!okGetEURe){
            TransferStuck(transferId, userWallet, amount, "");
            return false;
        }

        (bool okApproveWrap, uint256 amountJEUR) = routage_jEURfromEURe(transferId, amount, amount);
        if(!okApproveWrap || amountJEUR==0){
            TransferStuck(transferId, userWallet, amount, "");
            return false;
        }

        uint price = getLatestPrice();        
        uint collateralUSDC = (amountJEUR/10e8)*price; 

        (bool okApprouveJEUR, bool okApprouveUSDC, uint256 collateralRedeemed, uint256 feePaid) = routage_USDCfromjEUR(transferId, amountJEUR, collateralUSDC);
        if(!okApprouveJEUR || !okApprouveUSDC || collateralRedeemed==0 || feePaid==0){
            TransferStuck(transferId, userWallet, amount, "");
            return false;
        }

        bool okTransferToHub2Wallet = transferToHUB2Wallet(transferId, collateralRedeemed);
        if(!okTransferToHub2Wallet){
            TransferStuck(transferId, userWallet, amount, "");
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
        transfers[transferId].status=TransferStatus.INITIALIZED;
        
        emit TransferInitilized(transferId, amount);
    }

    function finalizeTransfer(string calldata transferId, string memory transactionCode) internal{
        transfers[transferId].status=TransferStatus.FINALIZED;
        
        emit TransferFinalized(transferId, transactionCode);
    }

    function amountReceived(string calldata transferId, uint amount) internal{
        transfers[transferId].status=TransferStatus.EURE_RECEIVED;
        transfers[transferId].amount_EURe=amount;
        
        emit TransferStatusChanged(transferId, TransferStatus.EURE_RECEIVED, "");
    }

    function amountWrapped(string calldata transferId, uint amount) internal{
        transfers[transferId].status=TransferStatus.JEUR_WRAPPED;
        transfers[transferId].amount_jEUR=amount;
        
        emit TransferStatusChanged(transferId, TransferStatus.JEUR_WRAPPED, "");
    }

    function redeemCollateral(string calldata transferId, uint collateral) internal{
        transfers[transferId].status=TransferStatus.USDC_RECEIVED;
        transfers[transferId].amount_USDC=collateral;
        
        emit TransferStatusChanged(transferId, TransferStatus.USDC_RECEIVED, "");
    }

    function collateralSent(string calldata transferId) internal{
        transfers[transferId].status=TransferStatus.USDC_SENT;
        
        emit TransferStatusChanged(transferId, TransferStatus.USDC_SENT, "");
    }

    function TransferStuck(string calldata transferId, address userWallet, uint amount, string memory errorMsg) internal returns (bool ok){
        transfers[transferId].status=TransferStatus.TRANSFER_STUCK;

        ok = moneriumEURemoney.transfer(userWallet, amount);
        
        emit TransferStatusChanged(transferId, TransferStatus.TRANSFER_STUCK, errorMsg);
    }
    // *********************************************************************************


    // *********************** GET EURe from user's wallet *****************************
    function transferFrom(string calldata transferId, address userWallet, uint256 amount) internal returns (bool ok){
        ok = moneriumEURemoney.transferFrom(userWallet, BLOCKSEND_WALLET, amount);

        amountReceived(transferId, amount);
    }
    // *********************************************************************************
    

    // *********************** Wrap EURe to JEUR ***************************************
    function routage_jEURfromEURe(string calldata transferId, uint256 amount, uint256 collateral) internal returns(bool ok, uint256 amountTokens){
        
        ok = moneriumEURemoney.approve(WRAPPER_CONTRACT, amount);
        amountTokens = jarvisWrapper.wrap(collateral, address(this));

        amountWrapped(transferId, amountTokens);
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
                expiration: block.timestamp+30,
                recipient: address(this)
            });
 
        (collateralRedeemed, feePaid) = jarvisSynthereum.redeem(params);
        
        redeemCollateral(transferId, collateralRedeemed);
    }
    // *********************************************************************************
    

    // *********************** Transfer USDC to HUB2 Wallet ****************************
    function transferToHUB2Wallet(string calldata transferId, uint256 amount) internal returns ( bool ok ){
        ok = uSDCToken.transfer(HUB2_WALLET, amount);

        collateralSent(transferId);
    }
    // *********************************************************************************
    

    // *********************** Take 2% fees ****************************
    function takeFess(uint256 amount) internal returns ( bool ok ){
        ok = uSDCToken.transfer(address(this), amount);
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
    
    function AllowAddress(address _addr) external onlyOwner {
        allowed[_addr] = true;
    }
    // *********************************************************************************


    // *********************** Get the latest rate *************************************
    function getLatestPrice() public view returns (uint) {
        (, int price , , ,) = priceFeed.latestRoundData();
        return uint(price/1000);
    }
    // *********************************************************************************
}
