var Web3 = require('web3');
require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const ABI = require('../client/contracts/BlockSendRouter.json').abi;

provider = new HDWalletProvider(`${process.env.MNEMONIC}`, `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`)
web3 = new Web3(provider);

const contract = new web3.eth.Contract(ABI, '0xf5Fcd5F8633F3C26f4b0A52E1C1BA765eAe2E672');
contract.getPastEvents('TransferFinalized', {
  fromBlock: 0,
  toBlock: 'latest'
}).then(console.log)

// contract.methods.transfers("639641056dd28ce64d762ff0").call().then(console.log)
