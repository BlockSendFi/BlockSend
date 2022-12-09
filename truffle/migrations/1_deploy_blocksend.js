const BlockSendToken = artifacts.require("BlockSendToken");
const BlockSendRouter = artifacts.require("BlockSendRouter");

module.exports = async function (deployer) {
  await deployer.deploy(BlockSendToken)
  const blockSendTokenInstance = await BlockSendToken.deployed()
  await deployer.deploy(BlockSendRouter, blockSendTokenInstance.address);
  const blockSendRouterInstance = await BlockSendRouter.deployed()

  await blockSendTokenInstance.setMinter(blockSendRouterInstance.address)

  // Change owner of 
  console.log(`All is good ;) | BlockSendToken address: ${blockSendTokenInstance.address} | BlockSendRouter address: ${blockSendRouterInstance.address}`)
};
