// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract BlockSendStakingRewards is Ownable {
    address private USDC_TOKEN_CONTRACT =
        0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;

    IERC20 private immutable BKSDToken;
    IERC20 private immutable USDCToken;

    event Staked(address staker, uint256 _amount);
    event Unstaked(address staker, uint256 _amount);
    event WithdrawRewards(address staker, uint256 rewards);

    uint256 public startDate;
    uint256 public endDate;

    uint256 public totalPowers;
    uint256 public totalRewards;
    uint256 public userPower;

    mapping(address => uint256) public userTokensStaked;
    mapping(address => uint256) public userPowerStaked;
    mapping(uint256 => uint256) public rewards;
    mapping(address => bool) public rewardsAlreadyClaimed;
    mapping(address => uint256) public userAdditionalLock;

    address private router;

    constructor(
        address _blocksSendTokenAdress,
        uint256 _startDate,
        uint256 _endDate
    ) {
        BKSDToken = IERC20(_blocksSendTokenAdress);
        USDCToken = IERC20(USDC_TOKEN_CONTRACT);
        startDate = _startDate;
        endDate = _endDate;
    }

    modifier onlyRouter() {
        require(msg.sender == router, "Only router can add rewards");
        _;
    }

    function stake(uint256 _amount, uint256 _additionalDuration) external {
        require(block.timestamp < startDate, "stacking impossible!");

        BKSDToken.approve(address(this), _amount);
        BKSDToken.transferFrom(msg.sender, address(this), _amount);
        userTokensStaked[msg.sender] += _amount;

        uint8 coeff = 1;
        // The user choose to lock an additional month
        if (_additionalDuration > (86400 * 30)) {
            coeff = 3;
        }

        // The user choose to lock 2 additional months
        if (_additionalDuration > (86400 * 60)) {
            coeff = 5;
        }

        userPower = _amount * coeff;
        userPowerStaked[msg.sender] += userPower;

        // If the user has already lock some tokens, we choose the longest duration
        if (_additionalDuration > userAdditionalLock[msg.sender]) {
            userPowerStaked[msg.sender] = _additionalDuration;
        }

        userAdditionalLock[msg.sender] = _additionalDuration;
        totalPowers += userPower;

        // totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }

    function claimRewards() external {
        require(block.timestamp > endDate, "Too soon to claim rewards!");
        require(
            rewardsAlreadyClaimed[msg.sender] == false,
            "Already claimed rewards!"
        );

        //  We calculate the rewards and send them to the user
        uint256 USDCRewards = (userPowerStaked[msg.sender] / totalPowers) *
            totalRewards;
        USDCToken.transfer(msg.sender, USDCRewards);
        emit WithdrawRewards(msg.sender, USDCRewards);
        rewardsAlreadyClaimed[msg.sender] = true;
    }

    function unstake() external {
        require(
            block.timestamp > (endDate + userAdditionalLock[msg.sender]),
            "Too soon to unstake!"
        );
        require(userTokensStaked[msg.sender] > 0, "No staked tokens!");

        if (rewardsAlreadyClaimed[msg.sender] == false) {
            //  We calculate the rewards and send them to the user
            uint256 USDCRewards = (userPowerStaked[msg.sender] / totalPowers) *
                totalRewards;
            USDCToken.transfer(msg.sender, USDCRewards);
            emit WithdrawRewards(msg.sender, USDCRewards);
            rewardsAlreadyClaimed[msg.sender] = true;
        }

        //  We send the staked tokens back to the user
        totalPowers -= userPowerStaked[msg.sender];
        BKSDToken.transfer(msg.sender, userTokensStaked[msg.sender]);
        emit Unstaked(msg.sender, userTokensStaked[msg.sender]);
        userTokensStaked[msg.sender] = 0;
        userPowerStaked[msg.sender] = 0;
    }

    function getMyStakedTokens() external view returns (uint256) {
        return userTokensStaked[msg.sender];
    }

    function getMyUSDCRewards() external view returns (uint256) {
        return (userPowerStaked[msg.sender] / totalPowers) * totalRewards;
    }

    function setRouter(address _router) public onlyOwner {
        router = _router;
    }

    // TODO: Change the modifier here
    function addRewards(uint256 _amount) external onlyRouter {
        require(
            block.timestamp >= startDate && block.timestamp <= endDate,
            "add rewards impossible!"
        );
        totalRewards += _amount;
        rewards[block.timestamp] = _amount;
    }
}
