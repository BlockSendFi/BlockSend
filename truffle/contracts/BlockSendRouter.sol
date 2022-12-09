// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IFixedRateWrapper.sol";
import "./interfaces/ISynthereum.sol";
import "./BlockSendToken.sol";

contract BlockSendRouter is Ownable {
    AggregatorV3Interface private priceFeed;

    IFixedRateWrapper private jarvisWrapper;
    ISynthereum private jarvisSynthereum;
    IERC20 private moneriumEURemoney;
    IERC20 private jEURToken;
    IERC20 private USDCToken;
    BlockSendToken private BKSDToken;
    mapping(address => uint256) private transferRewardsBalance;

    address private WRAPPER_CONTRACT =
        0xb07Cb016440331be4D2f532b20d892a420476AD0;
    address private SYNTHEREUM_CONTRACT =
        0x65a7b4Ff684C2d08c115D55a4B089bf4E92F5003;
    address private EURE_TOKEN_CONTRACT =
        0x18ec0A6E18E5bc3784fDd3a3634b31245ab704F6;
    address private JEUR_TOKEN_CONTRACT =
        0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c;
    address private USDC_TOKEN_CONTRACT =
        0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    address private BKSD_TOKEN_CONTRACT =
        0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c; // TODO: change this

    address private EUR_USD_AGGREGATOR =
        0x73366Fe0AA0Ded304479862808e02506FE556a98;
    address private HUB2_WALLET = 0xeD85CAeb52C34bD35dfeEB2d4e0bC936a0Db0923;
    address private BLOCKSEND_BACKEND =
        0x913Cd67dA3b17be7f66E865158cDF9a5c4F2a850;
    address private BLOCKSEND_WALLET =
        0x7f3eE84Fd13D815ff1005B7904Cd67084D8f353F;

    mapping(string => Remittance) public transfers;
    struct Remittance {
        address sender;
        uint256 amount_EURe;
        uint256 amount_jEUR;
        uint256 amount_USDC;
        uint256 userAmount_USDC;
        uint256 blocksendAmount_USDC;
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

    mapping(address => bool) private allowed;

    event TransferInitilized(string transferId, uint256 amount);
    event TransferStatusChanged(
        string transferId,
        TransferStatus currentStatus,
        string errorMsg
    );
    event TransferFinalized(
        string transferId,
        uint256 userAmount,
        uint256 blocksendAmount
    );
    event ClaimTransferRewardEvent(address user, uint256 tokenAmount);

    modifier onlyAllowed() {
        require(allowed[msg.sender], "You're allowed to initiate a transfer");
        _;
    }

    constructor(address _blocksSendTokenAdress) {
        allowed[BLOCKSEND_BACKEND] = true;
        jarvisWrapper = IFixedRateWrapper(WRAPPER_CONTRACT);
        jarvisSynthereum = ISynthereum(SYNTHEREUM_CONTRACT);
        moneriumEURemoney = IERC20(EURE_TOKEN_CONTRACT);
        jEURToken = IERC20(JEUR_TOKEN_CONTRACT);
        USDCToken = IERC20(USDC_TOKEN_CONTRACT);
        priceFeed = AggregatorV3Interface(EUR_USD_AGGREGATOR);
        BKSDToken = BlockSendToken(_blocksSendTokenAdress);
    }

    /**
     * @notice Iinitialise a transfer of an amount of EURe
     * @notice First Step: On-Ramp:
     * @notice 1- Transfer EURe from user's wallet
     * @notice 2- Wrap EURe to jEUR (Jarvis wrapper)
     * @notice 3- Get jEUR/USDC Rate (Aggregator Chainlink)
     * @notice 4- Redeem USDC from jEUR (Jarvis Redeem)
     * @notice Secod Step: Calculate 1,9% of fees
     * @notice Third Step: Off-Ramp: Using HUB2
     * @notice if any error: Sent money to users wallet back
     * @param transferId Input parameters transferId
     * @param amount Input parameters for for transfered amount
     * @param userWallet Input parameters for user wallet
     * @return ok a boolean value indicating whether the operation succeeded.
     *
     * Emits a {TransferStatusChanged} event with the current status of the transfer.
     */
    function initializeTransfer(
        string calldata transferId,
        address userWallet,
        uint256 amount
    ) external onlyAllowed returns (bool ok) {
        initilizeTransferData(transferId, userWallet, amount);

        // TODO: check the minimal amount here
        // TODO: Remove useless events

        transferRewardsBalance[userWallet] += amount / 2;

        bool okGetEURe = transferFrom(transferId, userWallet, amount);
        if (!okGetEURe) {
            TransferStuck(transferId, userWallet, amount, "");
            return false;
        }

        (bool okApproveWrap, uint256 amountJEUR) = routage_jEURfromEURe(
            transferId,
            amount,
            amount
        );
        if (!okApproveWrap || amountJEUR == 0) {
            TransferStuck(transferId, userWallet, amount, "");
            return false;
        }

        uint256 price = getLatestPrice();
        uint256 collateralUSDC = uint256((amountJEUR * price) / 10e18);

        (
            bool okApprouveJEUR,
            bool okApprouveUSDC,
            uint256 collateralRedeemed,
            uint256 feePaid
        ) = routage_USDCfromjEUR(transferId, amountJEUR, collateralUSDC);
        if (
            !okApprouveJEUR ||
            !okApprouveUSDC ||
            collateralRedeemed == 0 ||
            feePaid == 0
        ) {
            TransferStuck(transferId, userWallet, amount, "");
            return false;
        }

        bool okTransferWallet = transferUSDC(transferId, collateralRedeemed);
        if (!okTransferWallet) {
            TransferStuck(transferId, userWallet, amount, "");
            return false;
        }

        finalizeTransfer(transferId);

        return true;
    }

    function claimTransferRewards() external {
        // TODO: Add a require if necessary to avoid claim small amount of BSKD
        uint256 amount = transferRewardsBalance[msg.sender];
        transferRewardsBalance[msg.sender] = 0;
        BKSDToken.mint(msg.sender, amount);
        emit ClaimTransferRewardEvent(msg.sender, amount);
    }

    /**
     * Returns the current status of a specific remmitance.
     */
    function remittanceStatus(string calldata transferId)
        public
        view
        virtual
        returns (TransferStatus)
    {
        return transfers[transferId].status;
    }

    // *********************** Manage Status changed ************************************
    function initilizeTransferData(
        string calldata transferId,
        address userWallet,
        uint256 amount
    ) internal {
        transfers[transferId].sender = userWallet;
        transfers[transferId].status = TransferStatus.INITIALIZED;

        emit TransferInitilized(transferId, amount);
    }

    function finalizeTransfer(string calldata transferId) internal {
        transfers[transferId].status = TransferStatus.FINALIZED;

        emit TransferFinalized(
            transferId,
            transfers[transferId].userAmount_USDC,
            transfers[transferId].blocksendAmount_USDC
        );
    }

    function amountReceived(string calldata transferId, uint256 amount)
        internal
    {
        transfers[transferId].status = TransferStatus.EURE_RECEIVED;
        transfers[transferId].amount_EURe = amount;

        emit TransferStatusChanged(
            transferId,
            TransferStatus.EURE_RECEIVED,
            ""
        );
    }

    function amountWrapped(string calldata transferId, uint256 amount)
        internal
    {
        transfers[transferId].status = TransferStatus.JEUR_WRAPPED;
        transfers[transferId].amount_jEUR = amount;

        emit TransferStatusChanged(transferId, TransferStatus.JEUR_WRAPPED, "");
    }

    function redeemCollateral(string calldata transferId, uint256 collateral)
        internal
    {
        transfers[transferId].status = TransferStatus.USDC_RECEIVED;
        transfers[transferId].amount_USDC = collateral;

        emit TransferStatusChanged(
            transferId,
            TransferStatus.USDC_RECEIVED,
            ""
        );
    }

    function collateralSent(
        string calldata transferId,
        uint256 userAmount,
        uint256 blocksendAmount
    ) internal {
        transfers[transferId].status = TransferStatus.USDC_SENT;
        transfers[transferId].userAmount_USDC = userAmount;
        transfers[transferId].blocksendAmount_USDC = blocksendAmount;

        emit TransferStatusChanged(transferId, TransferStatus.USDC_SENT, "");
    }

    function TransferStuck(
        string calldata transferId,
        address userWallet,
        uint256 amount,
        string memory errorMsg
    ) internal returns (bool ok) {
        transfers[transferId].status = TransferStatus.TRANSFER_STUCK;

        ok = moneriumEURemoney.transfer(userWallet, amount);

        emit TransferStatusChanged(
            transferId,
            TransferStatus.TRANSFER_STUCK,
            errorMsg
        );
    }

    // *********************************************************************************

    // *********************** GET EURe from user's wallet *****************************
    function transferFrom(
        string calldata transferId,
        address userWallet,
        uint256 amount
    ) internal returns (bool ok) {
        ok = moneriumEURemoney.transferFrom(userWallet, address(this), amount);

        amountReceived(transferId, amount);
    }

    // *********************************************************************************

    // *********************** Wrap EURe to JEUR ***************************************
    function routage_jEURfromEURe(
        string calldata transferId,
        uint256 amount,
        uint256 collateral
    ) internal returns (bool ok, uint256 amountTokens) {
        ok = moneriumEURemoney.approve(WRAPPER_CONTRACT, amount);
        amountTokens = jarvisWrapper.wrap(collateral, address(this));

        amountWrapped(transferId, amountTokens);
    }

    // *********************************************************************************

    // *********************** Wurn & Mint (Redeem) UCDS from JEUR *********************
    function routage_USDCfromjEUR(
        string calldata transferId,
        uint256 _numToken,
        uint256 _minCollateral
    )
        internal
        returns (
            bool okApprouveJEUR,
            bool okApprouveUSDC,
            uint256 collateralRedeemed,
            uint256 feePaid
        )
    {
        okApprouveJEUR = jEURToken.approve(SYNTHEREUM_CONTRACT, _numToken);
        okApprouveUSDC = USDCToken.approve(SYNTHEREUM_CONTRACT, _minCollateral);

        ISynthereum.RedeemParams memory params = ISynthereum.RedeemParams({
            numTokens: _numToken,
            minCollateral: _minCollateral,
            expiration: block.timestamp + 30,
            recipient: address(this)
        });

        (collateralRedeemed, feePaid) = jarvisSynthereum.redeem(params);

        redeemCollateral(transferId, collateralRedeemed);
    }

    // *********************************************************************************

    // *********************** Transfer USDC to HUB2 Wallet & BlockSend Wallet *********
    function transferUSDC(
        string calldata transferId,
        uint256 collateralRedeemed
    ) internal returns (bool ok) {
        (uint256 blocksendAmount, uint256 userAmount) = calculateFees(
            collateralRedeemed
        );

        bool okBlocksend = USDCToken.transfer(
            BLOCKSEND_WALLET,
            blocksendAmount
        );
        bool okHUB2 = USDCToken.transfer(HUB2_WALLET, userAmount);

        collateralSent(transferId, userAmount, blocksendAmount);

        return okHUB2 && okBlocksend;
    }

    // *********************************************************************************

    // *********************** Calculate 1,9% fees *************************************
    function calculateFees(uint256 amount)
        internal
        pure
        returns (uint256 blocksendAmount, uint256 userAmount)
    {
        blocksendAmount = (amount * 19) / 1000;
        userAmount = amount - blocksendAmount;
    }

    // *********************************************************************************

    // *********************** Update Contracts Addresses ******************************
    function setWrapperContract(address newAddress) external onlyOwner {
        WRAPPER_CONTRACT = newAddress;
        jarvisWrapper = IFixedRateWrapper(WRAPPER_CONTRACT);
    }

    function setSyntheriumContract(address newAddress) external onlyOwner {
        SYNTHEREUM_CONTRACT = newAddress;
        jarvisSynthereum = ISynthereum(SYNTHEREUM_CONTRACT);
    }

    function setEURETokenContract(address newAddress) external onlyOwner {
        EURE_TOKEN_CONTRACT = newAddress;
        moneriumEURemoney = IERC20(EURE_TOKEN_CONTRACT);
    }

    function setJEURToken_Contract(address newAddress) external onlyOwner {
        JEUR_TOKEN_CONTRACT = newAddress;
        jEURToken = IERC20(JEUR_TOKEN_CONTRACT);
    }

    function setBKSDTokenContract(address newAddress) external onlyOwner {
        BKSDToken = BlockSendToken(newAddress);
    }

    function setUSDCTokenContract(address newAddress) external onlyOwner {
        USDC_TOKEN_CONTRACT = newAddress;
        USDCToken = IERC20(USDC_TOKEN_CONTRACT);
    }

    function setEUR_USD_Aggregator(address newAddress) external onlyOwner {
        EUR_USD_AGGREGATOR = newAddress;
        priceFeed = AggregatorV3Interface(EUR_USD_AGGREGATOR);
    }

    function setHUB2Wallet(address newAddress) external onlyOwner {
        HUB2_WALLET = newAddress;
    }

    function setBlockSend_Wallet(address newAddress) external onlyOwner {
        BLOCKSEND_WALLET = newAddress;
    }

    function AllowAddress(address _addr) external onlyOwner {
        allowed[_addr] = true;
    }

    // *********************************************************************************

    // *********************** Get the latest rate *************************************
    function getLatestPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price / 1000);
    }
    // *********************************************************************************
}
