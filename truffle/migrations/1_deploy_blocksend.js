const BlockSendToken = artifacts.require("BlockSendToken");
const BlockSendRouter = artifacts.require("BlockSendRouter");
const BlockSendStakingRewards = artifacts.require("BlockSendStakingRewards");

module.exports = async function (deployer) {
  const startDate = new Date('2022-12-12').getTime();
  const endDate = new Date('2022-12-31').getTime();

  
  await deployer.deploy(BlockSendToken)
  const blockSendTokenInstance = await BlockSendToken.deployed()
  
  await deployer.deploy(BlockSendStakingRewards, blockSendTokenInstance.address, startDate, endDate);
  const BlockSendStakingRewardsInstance = await BlockSendStakingRewards.deployed()

  await deployer.deploy(BlockSendRouter, blockSendTokenInstance.address);
  const blockSendRouterInstance = await BlockSendRouter.deployed()

  await blockSendTokenInstance.setMinter(blockSendRouterInstance.address)

  // Change owner of 
  console.log(`All is good ;) | BlockSendToken address: ${blockSendTokenInstance.address} | BlockSendRouter address: ${blockSendRouterInstance.address} | BlockSendStakingRewards address: ${BlockSendStakingRewardsInstance.address}`)
};
