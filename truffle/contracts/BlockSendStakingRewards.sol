// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

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

    uint256 public totalStaked;
    uint256 public totalRewards;
    uint256 public userPower;

    mapping(address => uint256) public userTokensStaked;
    mapping(uint256 => uint256) public rewards;

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

    function stake(uint256 _amount) external {
        require(block.timestamp < startDate, "stacking impossible!");

        BKSDToken.approve(address(this), _amount);
        BKSDToken.transferFrom(msg.sender, address(this), _amount);
        userTokensStaked[msg.sender] += _amount;
        totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }

    function claimAndUnstake() external {
        require(block.timestamp > endDate, "unstacking impossible!");
        require(userTokensStaked[msg.sender] > 0, "no staked tokens");

        //  We calculate the rewards and send them to the user
        uint256 USDCRewards = (userTokensStaked[msg.sender] / totalStaked) *
            totalRewards;
        USDCToken.transfer(msg.sender, USDCRewards);
        emit WithdrawRewards(msg.sender, USDCRewards);

        //  We send the staked tokens back to the user
        totalStaked -= userTokensStaked[msg.sender];
        BKSDToken.transfer(msg.sender, userTokensStaked[msg.sender]);
        emit Unstaked(msg.sender, userTokensStaked[msg.sender]);
        userTokensStaked[msg.sender] = 0;
    }

    function getMyStakedTokens() external view returns (uint256) {
        return userTokensStaked[msg.sender];
    }

    function getMyUSDCRewards() external view returns (uint256) {
        return (userTokensStaked[msg.sender] / totalStaked) * totalRewards;
    }

    // TODO: Change the modifier here
    function addRewards(uint256 _amount) external onlyOwner {
        require(
            block.timestamp >= startDate && block.timestamp <= endDate,
            "add rewards impossible!"
        );
        totalRewards += _amount;
        rewards[block.timestamp] = _amount;
    }
}
