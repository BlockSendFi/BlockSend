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
    event UnStaked(address staker, uint256 _amount);
    event WithdrawRewards(address staker, uint256 rewards);

    uint256 public duration;
    uint256 public expiresAt;
    uint256 public lastRewardUpdateAt;
    uint256 public rewardRate;
    uint256 public rewardPerTokenStaked;
    uint256 public totalStaked;

    mapping(address => uint256) public userTokensStaked;
    mapping(address => uint256) public rewards;

    constructor(address _blocksSendTokenAdress) {
        BKSDToken = IERC20(_blocksSendTokenAdress);
        USDCToken = IERC20(USDC_TOKEN_CONTRACT);
    }

    function setRewardDuration(uint256 _duration) external onlyOwner {
        require(block.timestamp > expiresAt, "Not valid !");

        duration = _duration;
    }

    function setRewardRate(uint256 _amount) external onlyOwner {
        require(_amount > 0);
        if (block.timestamp > expiresAt) {
            rewardRate = _amount / duration;
        } else {
            uint256 remainingREWARDS = rewardRate *
                (expiresAt - block.timestamp);
            rewardRate = (remainingREWARDS + _amount) / duration;
        }

        require(
            rewardRate * duration <= USDCToken.balanceOf(address(this)),
            "not enough balance for the given _amount input"
        );

        expiresAt = block.timestamp + duration;
        lastRewardUpdateAt = block.timestamp;
    }

    function stake(uint256 _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount not valid!");

        BKSDToken.transferFrom(msg.sender, address(this), _amount);
        userTokensStaked[msg.sender] += _amount;
        totalStaked += _amount;

        emit Staked(msg.sender, _amount);
    }

    function unStake(uint256 _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount not valid!");
        require(
            _amount < userTokensStaked[msg.sender],
            "your staked tokens less than the input _amount"
        );

        BKSDToken.transfer(msg.sender, _amount);
        userTokensStaked[msg.sender] -= _amount;
        totalStaked -= _amount;

        emit UnStaked(msg.sender, _amount);
    }

    function _min(uint256 _x, uint256 _y) private pure returns (uint256) {
        return _x <= _y ? _x : _y;
    }

    function withdrawRewards() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "no rewards earned yet");

        rewards[msg.sender] = 0;
        USDCToken.transfer(msg.sender, reward);
        emit WithdrawRewards(msg.sender, reward);
    }

    modifier updateReward(address _account) {
        require(totalStaked != 0, "no tokens staked yet");
        rewardPerTokenStaked =
            (rewardRate *
                (_min(block.timestamp, expiresAt) - lastRewardUpdateAt)) /
            totalStaked;

        rewards[msg.sender] +=
            userTokensStaked[msg.sender] *
            rewardPerTokenStaked;

        _;
    }
}
