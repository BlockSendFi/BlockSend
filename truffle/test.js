var Web3 = require('web3');
require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const ABI = require('../client/contracts/BlockSendRouter.json').abi;
const ABI2 = require('../client/contracts/BlockSendStakingRewards.json').abi;

provider = new HDWalletProvider(`${process.env.MNEMONIC}`, `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`)
web3 = new Web3(provider);

// const contract = new web3.eth.Contract(ABI, '0xf5Fcd5F8633F3C26f4b0A52E1C1BA765eAe2E672');
const contract = new web3.eth.Contract(ABI2, '0x4b2f25AE5c4D3a6921E0C6655e96F187D93B9CF4');
// contract.getPastEvents('TransferInitilized', {
//   fromBlock: 0,
//   toBlock: 'latest'
// }).then(console.log)

// contract.methods.getMyTranferRewardsBalance().call().then(console.log)
contract.methods.getMyUSDCRewards().call().then(console.log)
// contract.methods.transferRewardsBalance("0x876476aF52Bd7C2184fFf2dE4543356E4Baa56cA").call().then(console.log)
// contract.methods.transfers("t37").call().then(console.log)
// contract.methods.stake(1, 0).call().then(console.log)
