const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();
const web3 = require("web3")

module.exports = {
  contracts_build_directory: "../client/contracts",
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    goerli: {
      provider: function () {
        return new HDWalletProvider(`${process.env.MNEMONIC}`, `https://goerli.infura.io/v3/${process.env.INFURA_ID}`)
      },
      network_id: "5",
    },
    matictestnet: {
      provider: () => new HDWalletProvider(`${process.env.MNEMONIC}`, `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    fuji: {
      provider: () => new HDWalletProvider(`${process.env.MNEMONIC}`, `https://avalanche-fuji.infura.io/v3/${process.env.INFURA_ID}`),
      network_id: 43113,
      skipDryRun: true
    },
		maticmainnet: {
			provider: () => new HDWalletProvider(`${process.env.MNEMONIC}`, `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`),
			network_id: '137',
      gas: 4600000,
      gasPrice: web3.utils.toWei("50", "gwei"),
		},
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.14",      // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },
};
