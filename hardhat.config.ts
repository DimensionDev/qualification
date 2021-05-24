import { task } from "hardhat/config"
const utils = require('./utils.js');
import { ethers } from 'ethers'
const chai = require('chai')
const expect = chai.expect;
import 'hardhat-deploy'
import 'hardhat-deploy-ethers'
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-ethers"
import "solidity-coverage"

let current_network = "";
let snapshotList;
let snapshotContractABI;
let snapshotContract;

let luckydrawWhitelist;
let luckydrawContractABI;
let luckydrawContract;

const {
     infura_project_id,
     private_key_list,
} = require('./project.secret');

const transactionParameters = {
     gasLimit: 1000000,
     gasPrice: ethers.utils.parseUnits('5', 'gwei'),
     value: 0
 };

const networks = {
     localhost: {
          url: "http://127.0.0.1:8545",
          chainId: 1337,
     },
     hardhat: {
          blockGasLimit: 6000000,
          chainId: 31337,
          gas: 'auto',
     },
     ropsten: {
          url: 'https://ropsten.infura.io/v3/' + infura_project_id,
          accounts: private_key_list,
          chainId: 3,
          // 10gwei make test faster
          gasPrice: ethers.utils.parseUnits('10', 'gwei').toNumber(),
          // blockGasLimit 8000000
     },
     mainnet: {
          url: 'https://mainnet.infura.io/v3/' + infura_project_id,
          accounts: private_key_list,
          chainId: 1,
          // 10gwei make test faster
          gasPrice: ethers.utils.parseUnits('10', 'gwei').toNumber(),
          // blockGasLimit 8000000
     },
     bsc_test: {
          url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
          accounts: private_key_list,
          chainId: 97,
          // 25 Gwei, if too low, we might see "ProviderError: transaction underpriced" error.
          gasPrice: 25000000000,
          // blockGasLimit 8000000
     },
     // BSC mainnet not tested yet, not sure if it works
     bsc_mainnet: {
          url: 'https://bsc-dataseed1.binance.org:443',
          accounts: private_key_list,
          chainId: 56,
          // 5 Gwei
          gasPrice: 5000000000,
          // blockGasLimit 8000000
     },
     matic_mumbai_test: {
          url: 'https://rpc-mumbai.maticvigil.com',
          accounts: private_key_list,
          chainId: 80001,
          gasPrice: ethers.utils.parseUnits('10', 'gwei').toNumber(),
          // blockGasLimit 8000000
     },
     matic_mainnet: {
          url: 'https://rpc-mainnet.matic.network',
          accounts: private_key_list,
          chainId: 137,
          gasPrice: ethers.utils.parseUnits('10', 'gwei').toNumber(),
          // blockGasLimit 8000000
     },
};

const test_network_parameters = {
     snapshot_json_file: './deployments/ropsten/MaskTokenSnapshot.json',
     luckydraw_json_file: './deployments/ropsten/QLF_LUCKYDRAW.json',
     networks: {
          localhost: {
               snapshot_balance_contract_address: '0x42aca25Fd7Be774225abfbE4275beb9BF59c832f',
               snapshot_balance_list: './dataset/snapshotListMainnet.json',
               luckydraw_contract_address: '0x3998599c011e226b36e88a46b6331e81a86540b1',
               luckydraw_whitelist: './dataset/luckydrawWhitelist.json',
          },
          ropsten: {
               // we get ropsten addresses from JSON file because it is quite cheap to deploy
               snapshot_balance_contract_address: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
               snapshot_balance_list: './dataset/snapshotListRopsten.json',
               luckydraw_contract_address: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
               luckydraw_whitelist: './dataset/luckydrawWhitelist.json',
          },
          mainnet: {
               snapshot_balance_contract_address: '0x42aca25Fd7Be774225abfbE4275beb9BF59c832f',
               snapshot_balance_list: './dataset/snapshotListMainnet.json',
               luckydraw_contract_address: '0x3998599c011e226b36e88a46b6331e81a86540b1',
               luckydraw_whitelist: './dataset/luckydrawWhitelist.json',
          },
          bsc_test: {
               luckydraw_contract_address: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
               snapshot_balance_contract_address: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          },
          bsc_mainnet: {
               snapshot_balance_contract_address: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          },
     },
};

async function initialize(hre) {
     const signers = await hre.ethers.getSigners()
     const creator = signers[0]
     const chainId = await hre.getChainId();
     for (const [key, value] of Object.entries(networks)) {
          if (chainId === value.chainId.toString()) {
               current_network = key;
               break;
          }
     }
     if (current_network == "") {
          // should never happen
          throw 'no valid network found';
     }

     snapshotContractABI = require(test_network_parameters.snapshot_json_file);
     luckydrawContractABI = require(test_network_parameters.luckydraw_json_file);
     snapshotList = require(test_network_parameters.networks[current_network].snapshot_balance_list);
     luckydrawWhitelist = require(test_network_parameters.networks[current_network].luckydraw_whitelist);

     console.log("current network: " + current_network);
     {
          let contract_address = test_network_parameters.networks[current_network].snapshot_balance_contract_address;
          if (current_network === "ropsten") {
               contract_address = snapshotContractABI.address;
          }
          snapshotContract = new ethers.Contract(contract_address, snapshotContractABI.abi, creator);
     }
     {
          let contract_address = test_network_parameters.networks[current_network].luckydraw_contract_address;
          if (current_network === "ropsten") {
               contract_address = luckydrawContractABI.address;
          }
          luckydrawContract = new ethers.Contract(contract_address, luckydrawContractABI.abi, creator);
     }
     if (current_network === "mainnet")
     {
          const gasPriceList = await utils.getGasPrice(false);
          console.log("www.gasnow.org standard gas price: " + ethers.utils.formatUnits(gasPriceList.standard, 'gwei') + " Gwei");
          transactionParameters.gasPrice = gasPriceList.standard;

          console.log("----------------------------------------");
          console.log("WARNING: you are doing something on ETH mainnet, gas fee is expensive");
          console.log("If you think it is a mistake, CANCEL it within 10 seconds!");
          await utils.sleepMs(10000);
          console.log("----------------------------------------");
     }
     return;

}

task("update_snapshot_list", "batch_set_balance", async (_args, hre) => {
     await initialize(hre);
     if (snapshotList.addrs.length > 255) {
          throw "ERROR: can not add 255 entries because of the gas limit";
     }
     const tx = await snapshotContract.batch_set_balance(snapshotList.blockHeight, snapshotList.addrs, snapshotList.balances, transactionParameters)
     console.log('tx id:', `${tx.hash}`)
})

task("check_snapshot_list", "get_balance", async (_args, hre) => {
     await initialize(hre);
     for (let i = 0; i < snapshotList.addrs.length; i++) {
          console.log("checking balance of: " + snapshotList.addrs[i]);
          const value = await snapshotContract.get_balance(snapshotList.addrs[i]);
          expect(value).to.be.eq(snapshotList.balances[i])
     }
})

task("update_luckydraw_whitelist", "add_whitelist", async (_args, hre) => {
     await initialize(hre);
     if (luckydrawWhitelist.addrs.length > 255) {
          throw "ERROR: can not add 255 entries because of the gas limit";
     }
     const tx = await luckydrawContract.add_whitelist(luckydrawWhitelist.addrs, transactionParameters)
     console.log('tx id:', `${tx.hash}`)
})

task("check_luckydraw_whitelist", "ifQualified", async (_args, hre) => {
     await initialize(hre);
     for (let i = 0; i < luckydrawWhitelist.addrs.length; i++) {
          console.log("checking if address: " + luckydrawWhitelist.addrs[i] + " is whitelisted");
          const value = await luckydrawContract.ifQualified(luckydrawWhitelist.addrs[i]);
          expect(value).to.be.eq(true)
     }
})

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
     networks,
     mocha: {
          timeout: 500000
     },
     solidity: "0.8.0",
     namedAccounts: {
          deployer: {
               default: 0,
          },
     },
};
