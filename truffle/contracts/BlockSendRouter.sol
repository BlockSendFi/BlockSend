// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IFixedRateWrapper.sol";
import "./interfaces/ISynthereum.sol";
import "./BlockSendToken.sol";

contract BlockSendRouter is Ownable {
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
    // address private BKSD_TOKEN_CONTRACT =
    //     0x8d587d2Eaac88e6E228300180c921674a27ABFf3; // TODO: change this

    address private EUR_USD_AGGREGATOR =
        0x73366Fe0AA0Ded304479862808e02506FE556a98;
    address private USDC_USD_AGGREGATOR =
        0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7;

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
        uint256 rate_EUR_USDC;
        uint256 userAmount_USDC;
        uint256 blocksendAmount_USDC;
        uint256 jarvisFees_USDC;
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

    constructor(address _BKSD_TOKEN_CONTRACT) {
        allowed[BLOCKSEND_BACKEND] = true;
        jarvisWrapper = IFixedRateWrapper(WRAPPER_CONTRACT);
        jarvisSynthereum = ISynthereum(SYNTHEREUM_CONTRACT);
        moneriumEURemoney = IERC20(EURE_TOKEN_CONTRACT);
        jEURToken = IERC20(JEUR_TOKEN_CONTRACT);
        USDCToken = IERC20(USDC_TOKEN_CONTRACT);
        BKSDToken = BlockSendToken(_BKSD_TOKEN_CONTRACT);
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
        // require(amount >= 5 * 10e17, "insufficient amount");

        initilizeTransferData(transferId, userWallet, amount);

        bool okGetEURe = transferFrom(transferId, userWallet, amount);
        if (!okGetEURe) {
            TransferStuck(transferId, userWallet, amount);
            return false;
        }

        (bool okApproveWrap, uint256 amountJEUR) = routage_jEURfromEURe(
            transferId,
            amount,
            amount
        );
        if (!okApproveWrap || amountJEUR == 0) {
            TransferStuck(transferId, userWallet, amount);
            return false;
        }

        (
            bool okApprouveJEUR,
            bool okApprouveUSDC,
            uint256 collateralRedeemed,
            uint256 feePaid
        ) = routage_USDCfromjEUR(transferId, amountJEUR);
        if (!okApprouveJEUR || !okApprouveUSDC || collateralRedeemed == 0) {
            TransferStuck(transferId, userWallet, amount);
            return false;
        }

        bool okTransferWallet = transferUSDC(
            transferId,
            collateralRedeemed,
            feePaid
        );
        if (!okTransferWallet) {
            TransferStuck(transferId, userWallet, amount);
            return false;
        }

        transferRewardsBalance[userWallet] += amount / 2;

        finalizeTransfer(transferId);

        return true;
    }

    function getMyTranferRewardsBalance() external view returns (uint256) {
        return transferRewardsBalance[msg.sender];
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
    function remittanceStatus(
        string calldata _transferId
    ) public view virtual returns (TransferStatus) {
        return transfers[_transferId].status;
    }

    // *********************** Manage Status changed ************************************
    function initilizeTransferData(
        string calldata _transferId,
        address _userWallet,
        uint256 _amount
    ) internal {
        transfers[_transferId].sender = _userWallet;
        transfers[_transferId].status = TransferStatus.INITIALIZED;

        emit TransferInitilized(_transferId, _amount);
    }

    function finalizeTransfer(string calldata _transferId) internal {
        transfers[_transferId].status = TransferStatus.FINALIZED;

        emit TransferFinalized(
            _transferId,
            transfers[_transferId].userAmount_USDC,
            transfers[_transferId].blocksendAmount_USDC
        );
    }

    function amountReceived(
        string calldata _transferId,
        uint256 _amount
    ) internal {
        transfers[_transferId].status = TransferStatus.EURE_RECEIVED;
        transfers[_transferId].amount_EURe = _amount;
    }

    function amountWrapped(
        string calldata _transferId,
        uint256 _amount
    ) internal {
        transfers[_transferId].status = TransferStatus.JEUR_WRAPPED;
        transfers[_transferId].amount_jEUR = _amount;
    }

    function redeemCollateral(
        string calldata _transferId,
        uint256 _collateral,
        uint256 _rate,
        uint256 _feePaid
    ) internal {
        transfers[_transferId].status = TransferStatus.USDC_RECEIVED;
        transfers[_transferId].amount_USDC = _collateral;
        transfers[_transferId].rate_EUR_USDC = _rate;
        transfers[_transferId].jarvisFees_USDC = _feePaid;
    }

    function collateralSent(
        string calldata _transferId,
        uint256 _userAmount,
        uint256 _blockSendAmount
    ) internal {
        transfers[_transferId].status = TransferStatus.USDC_SENT;
        transfers[_transferId].userAmount_USDC = _userAmount;
        transfers[_transferId].blocksendAmount_USDC = _blockSendAmount;
    }

    function TransferStuck(
        string calldata _transferId,
        address _userWallet,
        uint256 _amount
    ) internal returns (bool ok) {
        transfers[_transferId].status = TransferStatus.TRANSFER_STUCK;

        ok = moneriumEURemoney.transfer(_userWallet, _amount);
    }

    // *********************************************************************************

    // *********************** GET EURe from user's wallet *****************************
    function transferFrom(
        string calldata _transferId,
        address _userWallet,
        uint256 _amount
    ) internal returns (bool ok) {
        ok = moneriumEURemoney.transferFrom(
            _userWallet,
            address(this),
            _amount
        );

        amountReceived(_transferId, _amount);
    }

    // *********************************************************************************

    // *********************** Wrap EURe to JEUR ***************************************
    function routage_jEURfromEURe(
        string calldata _transferId,
        uint256 _amount,
        uint256 _collateral
    ) internal returns (bool ok, uint256 amountTokens) {
        ok = moneriumEURemoney.approve(WRAPPER_CONTRACT, _amount);
        amountTokens = jarvisWrapper.wrap(_collateral, address(this));

        amountWrapped(_transferId, amountTokens);
    }

    // *********************************************************************************

    // *********************** Wurn & Mint (Redeem) UCDS from JEUR *********************
    function routage_USDCfromjEUR(
        string calldata _transferId,
        uint256 _numToken
    )
        internal
        returns (
            bool okApprouveJEUR,
            bool okApprouveUSDC,
            uint256 collateralRedeemed,
            uint256 feePaid
        )
    {
        uint256 price = 105400;
        uint256 collateralUSDC = uint256((_numToken * price) / 10e18);

        okApprouveJEUR = jEURToken.approve(SYNTHEREUM_CONTRACT, _numToken);
        okApprouveUSDC = USDCToken.approve(SYNTHEREUM_CONTRACT, collateralUSDC);

        ISynthereum.RedeemParams memory params = ISynthereum.RedeemParams({
            numTokens: _numToken,
            minCollateral: collateralUSDC,
            expiration: block.timestamp + 30,
            recipient: address(this)
        });

        (collateralRedeemed, feePaid) = jarvisSynthereum.redeem(params);

        redeemCollateral(_transferId, collateralRedeemed, price, feePaid);
    }

    // *********************************************************************************

    // *********************** Transfer USDC to HUB2 Wallet & BlockSend Wallet *********
    function transferUSDC(
        string calldata _transferId,
        uint256 _collateralRedeemed,
        uint256 _feePaid
    ) internal returns (bool ok) {
        (uint256 blocksendAmount, uint256 userAmount) = calculateBlockSendFees(
            _collateralRedeemed,
            _feePaid
        );

        bool okBlocksend = USDCToken.transfer(
            BLOCKSEND_WALLET,
            blocksendAmount
        );
        bool okHUB2 = USDCToken.transfer(HUB2_WALLET, userAmount);

        collateralSent(_transferId, userAmount, blocksendAmount);

        return okHUB2 && okBlocksend;
    }

    // *********************************************************************************

    // *********************** Calculate 1,9% fees *************************************
    function calculateBlockSendFees(
        uint256 _amount,
        uint256 _feePaid
    ) internal pure returns (uint256 blocksendAmount, uint256 userAmount) {
        blocksendAmount = ((_amount * 19) / 1000) - _feePaid;
        userAmount = _amount - blocksendAmount;
    }

    // *********************************************************************************

    // *********************** Update Contracts Addresses ******************************
    function setWrapperContract(address _newAddress) external onlyOwner {
        WRAPPER_CONTRACT = _newAddress;
        jarvisWrapper = IFixedRateWrapper(WRAPPER_CONTRACT);
    }

    function setSyntheriumContract(address _newAddress) external onlyOwner {
        SYNTHEREUM_CONTRACT = _newAddress;
        jarvisSynthereum = ISynthereum(SYNTHEREUM_CONTRACT);
    }

    function setEURETokenContract(address _newAddress) external onlyOwner {
        EURE_TOKEN_CONTRACT = _newAddress;
        moneriumEURemoney = IERC20(EURE_TOKEN_CONTRACT);
    }

    function setJEURToken_Contract(address _newAddress) external onlyOwner {
        JEUR_TOKEN_CONTRACT = _newAddress;
        jEURToken = IERC20(JEUR_TOKEN_CONTRACT);
    }

    function setUSDCTokenContract(address _newAddress) external onlyOwner {
        USDC_TOKEN_CONTRACT = _newAddress;
        USDCToken = IERC20(USDC_TOKEN_CONTRACT);
    }

    function setHUB2Wallet(address _newAddress) external onlyOwner {
        HUB2_WALLET = _newAddress;
    }

    function setBlockSend_Wallet(address _newAddress) external onlyOwner {
        BLOCKSEND_WALLET = _newAddress;
    }

    function AllowAddress(address _addr) external onlyOwner {
        allowed[_addr] = true;
    }

    // *********************************************************************************

    // *********************** Get the latest rate *************************************
    function get_EUR_USD_LatestPrice() public view returns (uint256) {
        (, int256 price, , , ) = AggregatorV3Interface(EUR_USD_AGGREGATOR)
            .latestRoundData();
        return uint256(price / 1000);
    }

    function get_USDC_USD_LatestPrice() public view returns (uint256) {
        (, int256 price, , , ) = AggregatorV3Interface(USDC_USD_AGGREGATOR)
            .latestRoundData();
        return uint256(price / 1000);
    }
    // *********************************************************************************
}
