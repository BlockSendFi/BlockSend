// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract BlockSendStakingRewards is Ownable {
    address private USDC_TOKEN_CONTRACT = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;

    IERC20 private immutable bKSDToken;
    IERC20 private immutable uSDCToken;

    event Staked(address staker,uint _amount);
    event UnStaked(address staker,uint _amount);
    event WithdrawRewards(address staker,uint rewards);

    uint public duration;
    uint public expiresAt;
    uint public lastRewardUpdateAt;
    uint public rewardRate;
    uint public rewardPerTokenStaked;
    uint public totalStaked;


    mapping(address => uint) public usertokens_staked;
    mapping(address => uint) public rewards;

    constructor(address _blocksSendTokenAdress) {
        bKSDToken = IERC20(_blocksSendTokenAdress);
        uSDCToken = IERC20(USDC_TOKEN_CONTRACT);
    }

    function setRewardDuration(uint _duration) external onlyOwner{
        require(block.timestamp > expiresAt,"Not valid !");

        duration = _duration;
    }

    function setRewardRate(uint _amount) external onlyOwner{
        require (_amount > 0 );
        if(block.timestamp > expiresAt){
             rewardRate = _amount/ duration;
        } else{
            uint remainingREWARDS = rewardRate * (expiresAt - block.timestamp);
            rewardRate = (remainingREWARDS + _amount) / duration;
        }

        require(rewardRate * duration <= uSDCToken.balanceOf(address(this)),"not enough balance for the given _amount input");

        expiresAt = block.timestamp + duration;
        lastRewardUpdateAt = block.timestamp;
    }

    function stake(uint256 _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount not valid!");
        
        bKSDToken.transferFrom(msg.sender, address(this), _amount);
        usertokens_staked[msg.sender] += _amount;
        totalStaked += _amount;

        emit Staked(msg.sender,_amount);
    }

    function unStake(uint256 _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount not valid!");
        require(_amount < usertokens_staked[msg.sender], "your staked tokens less than the input _amount");
        
        bKSDToken.transfer(msg.sender,_amount);
        usertokens_staked[msg.sender] -= _amount;
        totalStaked -= _amount;

        emit UnStaked(msg.sender,_amount);
    }
    function _min(uint _x, uint _y) private pure returns(uint){
        return _x <= _y ? _x : _y ;
    }

    function withdrawRewards() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0,"no rewards earned yet");
        
        rewards[msg.sender] = 0;
        uSDCToken.transfer(msg.sender, reward);
        emit WithdrawRewards(msg.sender, reward);
    } 

    modifier updateReward(address _account) {

        require(totalStaked != 0,"no tokens staked yet");
        rewardPerTokenStaked = rewardRate * (_min(block.timestamp,expiresAt) - lastRewardUpdateAt)/ totalStaked; 

        rewards[msg.sender] += usertokens_staked[msg.sender] * rewardPerTokenStaked;

        _;
    }
}
