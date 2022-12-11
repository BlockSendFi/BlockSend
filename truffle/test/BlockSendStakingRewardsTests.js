const BlockSendStakingRewards = artifacts.require("./BlockSendStakingRewards.sol");
const MyToken = artifacts.require("./BlockSendToken.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract('BlockSendStakingRewards', accounts => {
    const _owner = accounts[0];
    const _userWallet = accounts[1];

    let blockSendStakingRewardsInstance;
    let myTokenInstance;

    beforeEach(async function () {
        myTokenInstance = await MyToken.new({from: _owner});
        blockSendStakingRewardsInstance = await BlockSendStakingRewards.new(myTokenInstance.address, {from: _owner});
    })

    

    it("check stack done", async () => {
      let amount = new BN(100);
      blockSendStakingRewardsInstance.totalStaked=100
      await myTokenInstance.approve(_userWallet, amount);
      
      let userTokensStakedBefore = await blockSendStakingRewardsInstance.getUserStakedTokens({ from: _userWallet});
      expect(userTokensStakedBefore).to.be.bignumber.equal(new BN(0));

      await blockSendStakingRewardsInstance.stake(amount, { from: _userWallet});
  
      let userTokensStakedAfter = await blockSendStakingRewardsInstance.getUserStakedTokens({ from: _userWallet});
      expect(userTokensStakedAfter).to.be.bignumber.equal(amount);
    });


});