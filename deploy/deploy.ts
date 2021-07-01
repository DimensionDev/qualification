import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'ethers'

const hardhat_config = require('../hardhat.config.ts');
// const project_config = require('../project.config.js');
const MASK_token_decimals = 18;
const deploy_network_parameters = {
    networks: {
        localhost: {
            // ETH mainnet $MASK smart contract addresss
            token_address : "0x69af81e73a73b40adf4f3d4223cd9b1ece623074",
            token_decimal : MASK_token_decimals,
            luckydraw: {
                start_time : 0,
                // 50% chance
                lucky_factor : 2,
                max_gas_price : ethers.utils.parseUnits('4', 'gwei'),
                min_token_amount : "150",
            },
            snapshot_1000: {
                start_time : 0,
            },
        },
        ropsten : {
            // ropsten $MASK smart contract addresss
            token_address : "0x5b966f3a32db9c180843bcb40267a66b73e4f022",
            token_decimal : MASK_token_decimals,
            luckydraw: {
                start_time : 0,
                // 50% chance
                lucky_factor : 2,
                max_gas_price : ethers.utils.parseUnits('4', 'gwei'),
                min_token_amount : "150",
            },
            snapshot_1000: {
                start_time : 0,
            },
        },
        mainnet : {
            // ETH mainnet $MASK smart contract addresss
            token_address : "0x69af81e73a73b40adf4f3d4223cd9b1ece623074",
            token_decimal : MASK_token_decimals,
            luckydraw: {
                start_time : 0,
                // 50% chance
                lucky_factor : 2,
                // 100K gwei, very high
                max_gas_price : ethers.utils.parseUnits('100000', 'gwei'),
                min_token_amount : "150",
            },
        },
        bsc_test : {
            // USDC smart contract addresss
            token_address : "0x9780881bf45b83ee028c4c1de7e0c168df8e9eef",
            token_decimal : 6,
            luckydraw: {
                start_time : 0,
                // 50% chance
                lucky_factor : 2,
                // 100K gwei, very high
                max_gas_price : ethers.utils.parseUnits('100000', 'gwei'),
                min_token_amount : "150",
            },
        },
        bsc_mainnet : {
            // USDC smart contract addresss
            token_address : "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
            token_decimal : 18,
            luckydraw: {
                start_time : 0,
                // 50% chance
                lucky_factor : 2,
                // 100K gwei, very high
                max_gas_price : ethers.utils.parseUnits('100000', 'gwei'),
                min_token_amount : "150",
            },
        },
        matic_mumbai_test : {
            // USDC smart contract addresss
            token_address : "0xBD2094e633296909DDc7954Cf2f29e2f508112a2",
            token_decimal : 6,
            luckydraw: {
                start_time : 0,
                // 50% chance
                lucky_factor : 2,
                // 100K gwei, very high
                max_gas_price : ethers.utils.parseUnits('100000', 'gwei'),
                min_token_amount : "0",
            },
        },
        matic_mainnet : {
            // USDC smart contract addresss
            token_address : "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            token_decimal : 6,
            luckydraw: {
                start_time : 0,
                // 50% chance
                lucky_factor : 2,
                // 100K gwei, very high
                max_gas_price : ethers.utils.parseUnits('100000', 'gwei'),
                min_token_amount : "0",
            },
        },
    },
};
let current_network : string;
let deploy_parameters;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    await init_deploy_network_parameters(hre);
    await deploy('QLF_LUCKYDRAW', {
        from: deployer,
        args: ["QLF_LUCKYDRAW",
            deploy_parameters.luckydraw.start_time,
            deploy_parameters.luckydraw.max_gas_price,
            ethers.utils.parseUnits(deploy_parameters.luckydraw.min_token_amount, deploy_parameters.token_decimal),
            deploy_parameters.token_address,
            deploy_parameters.luckydraw.lucky_factor
        ],
        log: true,
    },
    )

    await deploy('QLF_SNAPSHOT', {
        from: deployer,
        args: [],
        log: true,
    },
    )

    await deploy('QLF_DUMMY', {
        from: deployer,
        args: ['QLF_DUMMY', 0],
        log: true,
    },
    )

    await deploy('QLF_SNAPSHOT_WHITELIST', {
        from: deployer,
        args: ['QLF_SNAPSHOT_WHITELIST', 0],
        log: true,
    },
    )

    await deploy('BalanceChecker', {
        from: deployer,
        args: [],
        log: true,
    },
    )

    await deploy('MaskToken', {
        from: deployer,
        // 1 billion
        args: [ethers.utils.parseUnits('1000000000', 18)],
        log: true,
    },
    )

    await deploy('Multicall', {
        from: deployer,
        args: [],
        log: true,
    },
    )
    
}

async function init_deploy_network_parameters(hre) {
    const chainId = await hre.getChainId();
    for (const [key, value] of Object.entries(hardhat_config.networks)) {
        interface Network {
            chainId: Number;
        }
        if (chainId === (value as Network).chainId.toString()) {
            current_network = key as string;
            console.log("current network: " + current_network);
            deploy_parameters = deploy_network_parameters.networks[current_network];
            return;
        }
    }
    // should never happen
    throw 'no valid network found';
}

func.tags = ['MaskQualification']

module.exports = func
