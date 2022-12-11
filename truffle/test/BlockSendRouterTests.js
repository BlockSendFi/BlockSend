const BlockSendRouter = artifacts.require("./BlockSendRouter.sol");
const MyToken = artifacts.require("./BlockSendToken.sol");
const MoneriumEURemoney = artifacts.require("./IERC20.sol");
const { BN, expectRevert, expectEvent } = require('../node_modules/@openzeppelin/test-helpers');
const { expect } = require('chai');


contract('BlockSendRouter', accounts => {
    const _owner = accounts[0];
    const _userWallet = accounts[1];
    const _backEnd = accounts[2];
    const _transferId = "TR0001";
    const _amount = new BN(100);

    let blockSendRouterInstance;
    let myTokenInstance;
    let moneriumEURemoneyInstance;

    context("Initialize Transfer", function() {

        beforeEach(async function () {
            moneriumEURemoneyInstance = await MoneriumEURemoney.deployed(0xecdF72dFa3f51AF61740Fd14bAdCa1947Bef657B);
            myTokenInstance = await MyToken.new({from: _owner});
            blockSendRouterInstance = await BlockSendRouter.new(myTokenInstance.address, {from: _owner});
        })
    
        it('Test on only Allowed', async function () {
            await expectRevert(blockSendRouterInstance.initializeTransfer(_transferId, _userWallet, _amount, {from: _backEnd}),
            "You're allowed to initiate a transfer")
        });
    
        it('Test on ', async function () {
            await blockSendRouterInstance.AllowAddress(_backEnd);
            await moneriumEURemoneyInstance.approve(blockSendRouterInstance.address, _amount);
            // await myTokenInstance.transferFrom(_owner, _recipient, amount, { from: _recipient})
            await blockSendRouterInstance.initializeTransfer(_transferId, _userWallet, _amount, {from: _backEnd});
            // [address sender, uint256 amount_EURe, uint256 amount_jEUR,
            //     uint256 amount_USDC,
            //     uint256 rate_EUR_USDC,
            //     uint256 userAmount_USDC,
            //     uint256 blocksendAmount_USDC,
            //     uint256 jarvisFees_USDC,
            //     TransferStatus status] = await blockSendRouterInstance.getTransfer(_transferId);
        });
    
    })

    context("Claim Tokens", function() {

        beforeEach(async function () {
            myTokenInstance = await MyToken.new({from: _owner});
            blockSendRouterInstance = await BlockSendRouter.new(myTokenInstance.address, {from: _owner});
        })
    
        it('Test on Transfer reward balance', async function () {
            let rewards = new BN(200);
            await blockSendRouterInstance.AllowAddress(_backEnd);
            blockSendRouterInstance.initializeTransfer(_transferId, _userWallet, _amount, {from: _backEnd});
            blockSendRouterInstance.initializeTransfer(_transferId, _userWallet, _amount, {from: _backEnd});
            let rewardsBalance = blockSendRouterInstance.getMyTranferRewardsBalance();
            expect(rewardsBalance).to.be.bignumber.equal(rewards);
        });
    
        it('Test on claim reward balance', async function () {
            let rewards = new BN(200);
            await blockSendRouterInstance.AllowAddress(_backEnd);
            blockSendRouterInstance.initializeTransfer(_transferId, _userWallet, _amount, {from: _backEnd});
            blockSendRouterInstance.initializeTransfer(_transferId, _userWallet, _amount, {from: _backEnd});
            
            let rewardsBalanceBeforeClaim = blockSendRouterInstance.getMyTranferRewardsBalance();
            expect(rewardsBalanceBeforeClaim).to.be.bignumber.equal(rewards);
            
            blockSendRouterInstance.claimTransferRewards({from: _backEnd});

            let rewardsBalanceAfterClaim = blockSendRouterInstance.getMyTranferRewardsBalance();
            expect(rewardsBalanceAfterClaim).to.be.bignumber.equal(0);
        });
    
    }) 

});