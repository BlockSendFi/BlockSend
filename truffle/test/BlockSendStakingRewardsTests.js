const BlockSendStakingRewards = artifacts.require("./BlockSendStakingRewards.sol");
const MyToken = artifacts.require("./BlockSendToken.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract('BlockSendStakingRewards', accounts => {
    const today = new Date();
    const _owner = accounts[0];
    const _userWallet = accounts[1];

    let blockSendStakingRewardsInstance;
    let myTokenInstance;

    beforeEach(async function () {
        myTokenInstance = await MyToken.new({from: _owner});
        blockSendStakingRewardsInstance = await BlockSendStakingRewards.new(myTokenInstance.address, 1670975042, 1671839042, {from: _owner});
    })
    
    it('Test stack revert', async function () {
      blockSendStakingRewardsInstance = await BlockSendStakingRewards.new(myTokenInstance.address, 1670715842, 1671839042, {from: _owner});
      let amount = new BN(100);
      await expectRevert(blockSendStakingRewardsInstance.stake(amount, 0, { from: _userWallet}), "stacking impossible!");
    });
    
    it('Test unstack revert too soon', async function () {
      blockSendStakingRewardsInstance = await BlockSendStakingRewards.new(myTokenInstance.address, 1670715842, 1671579842, {from: _owner});
      await expectRevert(blockSendStakingRewardsInstance.unstake({ from: _userWallet}), "Too soon to unstake!");
    });
    
    it('Test unstack revert no staked tokens', async function () {
      blockSendStakingRewardsInstance = await BlockSendStakingRewards.new(myTokenInstance.address, 1670715842, 1670715842, {from: _owner});
      await expectRevert(blockSendStakingRewardsInstance.unstake({ from: _userWallet}), "No staked tokens!");
    });
    
    it('Test claim rewards revert too soon to claim rewards', async function () {
      blockSendStakingRewardsInstance = await BlockSendStakingRewards.new(myTokenInstance.address, 1670715842, 1671579842, {from: _owner});
      await expectRevert(blockSendStakingRewardsInstance.claimRewards({ from: _userWallet}), "Too soon to claim rewards!");
    });
    
    it('Test unstack revert No staked tokens', async function () {
      blockSendStakingRewardsInstance = await BlockSendStakingRewards.new(myTokenInstance.address, 1670715842, 1670715842, {from: _owner});
      blockSendStakingRewardsInstance.rewardsAlreadyClaimed[_userWallet] = true;
      await expectRevert(blockSendStakingRewardsInstance.unstake({ from: _userWallet}), "No staked tokens!");
    });
    
    it('Test on only router', async function () {
      let amount = new BN(100);
      await expectRevert(blockSendStakingRewardsInstance.addRewards(amount, {from: _userWallet}), "Only router can add rewards")
    });
    
    it('Test add rawards revert', async function () {
      blockSendStakingRewardsInstance = await BlockSendStakingRewards.new(myTokenInstance.address, 1670715842, 1670715842, {from: _owner});
      await blockSendStakingRewardsInstance.setRouter(_userWallet);
      let amount = new BN(100);
      await expectRevert(blockSendStakingRewardsInstance.addRewards(amount, {from: _userWallet}), "add rewards impossible!");
    });

    

    it("check stack done", async () => {
      let amount = new BN(100);
      await myTokenInstance.approve(blockSendStakingRewardsInstance.address, amount);
      await myTokenInstance.approve(_userWallet, amount);
      
      let userTokensStakedBefore = await blockSendStakingRewardsInstance.getMyStakedTokens({ from: _userWallet});
      expect(userTokensStakedBefore).to.be.bignumber.equal(new BN(0));

      await blockSendStakingRewardsInstance.stake(amount, 0, { from: _userWallet});
  
      let userTokensStakedAfter = await blockSendStakingRewardsInstance.getMyStakedTokens({ from: _userWallet});
      expect(userTokensStakedAfter).to.be.bignumber.equal(amount);
    });

    it("check unstack done", async () => {
      let amount = new BN(100);
      blockSendStakingRewardsInstance.userTokensStaked[_userWallet]+=amount;
  
      let userTokensStakedBefore = await blockSendStakingRewardsInstance.getMyStakedTokens({ from: _userWallet});
      expect(userTokensStakedBefore).to.be.bignumber.equal(amount);
      
      await blockSendStakingRewardsInstance.unstake({ from: _userWallet});
  
      let userTokensStakedAfter = await blockSendStakingRewardsInstance.getMyStakedTokens({ from: _userWallet});
      expect(userTokensStakedAfter).to.be.bignumber.equal(new BN(0));
    });


});