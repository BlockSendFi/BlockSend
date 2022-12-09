// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract StakingRewards is Ownable {
    address private USDC_TOKEN_CONTRACT =
        0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;

    IERC20 public immutable bKSDToken;
    IERC20 public immutable uSDCToken;

    // User address => rewardPerTokenStored
    mapping(address => uint256) public userRewardPerTokenPaid;
    // User address => rewards to be claimed
    mapping(address => uint256) public rewards;
    // User address => staked amount
    mapping(address => uint256) public balanceOf;

    // Duration of rewards to be paid out (in seconds)
    uint256 public duration;
    // Total staked
    uint256 public totalStaked;
    // Sum of (reward rate * dt * 1e18 / total supply)
    uint256 public rewardPerTokenDetained;
    // Minimum of last updated time and reward finish time
    uint256 public lastRewarUpdatedAt;
    // Timestamp of when the rewards finish
    uint256 public expiresAt;
    // Reward to be paid out per second
    uint256 public rewardRate;

    constructor(address _stakingToken) {
        bKSDToken = IERC20(_stakingToken);
        uSDCToken = IERC20(USDC_TOKEN_CONTRACT);
    }

    modifier updateReward(address _account) {
        rewardPerTokenDetained = rewardPerToken();
        lastRewarUpdatedAt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenDetained;
        }

        _;
    }

    function claimTokens(uint256 _amount) external updateReward(msg.sender) {
        //mint Tokens
        // bKSDToken.mint(msg.sender, _amount);
        // bKSDToken.transfer(msg.sender, _amount);
    }

    function claimAndStackTokens() external {}

    function stake(uint256 _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount not valid!");
        bKSDToken.transferFrom(msg.sender, address(this), _amount);
        balanceOf[msg.sender] += _amount;
        totalStaked += _amount;
    }

    function unStake(uint256 _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount not valid!");
        require(
            _amount < balanceOf[msg.sender],
            "your staked tokens less than the input _amount"
        );

        bKSDToken.transfer(msg.sender, _amount);
        balanceOf[msg.sender] -= _amount;
        totalStaked -= _amount;
    }

    function withdrawRewards() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "no rewards yearned yet");
        rewards[msg.sender] = 0;
        uSDCToken.transfer(msg.sender, reward);
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return _min(expiresAt, block.timestamp);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenDetained;
        }

        return
            rewardPerTokenDetained +
            (rewardRate *
                (lastTimeRewardApplicable() - lastRewarUpdatedAt) *
                1e18) /
            totalStaked;
    }

    function earned(address _account) public view returns (uint256) {
        return
            ((balanceOf[_account] *
                (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) +
            rewards[_account];
    }

    function setRewardsDuration(uint256 _duration) external onlyOwner {
        require(expiresAt < block.timestamp, "reward duration not finished");
        duration = _duration;
    }

    function notifyRewardAmount(uint256 _amount)
        external
        onlyOwner
        updateReward(address(0))
    {
        if (block.timestamp >= expiresAt) {
            rewardRate = _amount / duration;
        } else {
            uint256 remainingRewards = (expiresAt - block.timestamp) *
                rewardRate;
            rewardRate = (_amount + remainingRewards) / duration;
        }

        require(rewardRate > 0, "reward rate = 0");
        require(
            rewardRate * duration <= uSDCToken.balanceOf(address(this)),
            "reward amount > balance"
        );

        expiresAt = block.timestamp + duration;
        lastRewarUpdatedAt = block.timestamp;
    }

    function _min(uint256 _x, uint256 _y) private pure returns (uint256) {
        return _x <= _y ? _x : _y;
    }
}
