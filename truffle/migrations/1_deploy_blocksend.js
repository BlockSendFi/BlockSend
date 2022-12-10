const BlockSendToken = artifacts.require("BlockSendToken");
const BlockSendRouter = artifacts.require("BlockSendRouter");
// const BlockSendStakingRewards = artifacts.require("BlockSendStakingRewards");

module.exports = async function (deployer) {
  await deployer.deploy(BlockSendToken)
  const blockSendTokenInstance = await BlockSendToken.deployed()

  await deployer.deploy(BlockSendRouter, blockSendTokenInstance.address);
  const blockSendRouterInstance = await BlockSendRouter.deployed()
<<<<<<< HEAD
  
  // await deployer.deploy(BlockSendStakingRewards, blockSendTokenInstance.address);
  // const BlockSendStakingRewardsInstance = await BlockSendStakingRewards.deployed()
=======

  await deployer.deploy(BlockSendStakingRewards, blockSendTokenInstance.address);
  const BlockSendStakingRewards = await BlockSendStakingRewards.deployed()
>>>>>>> 79f555d7680cba7855616add98eb22090a1e6f4b

  await blockSendTokenInstance.setMinter(blockSendRouterInstance.address)

  // Change owner of 
  console.log(`All is good ;) | BlockSendToken address: ${blockSendTokenInstance.address} | BlockSendRouter address: ${blockSendRouterInstance.address}`)
};
