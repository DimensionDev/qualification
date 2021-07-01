# Mask Network Miscellaneous Smart Contract

[中文版](./README_Chinese.md)

## Introduction

This repository contains miscellaneous smart contracts used(not necessarily developed) by Mask Network: `ITO qualification smart contracts`, `Mask ERC-20 token smart contract`, [BalanceChecker](https://github.com/wbobeirne/eth-balance-checker) and [Multicall](https://github.com/makerdao/multicall).

`Initial Twitter Offering (ITO) qualification smart contract` is an important part of `Mask Network ITO main smart contract`([source code](https://github.com/DimensionDev/InitialTwitterOffering/blob/master/contracts/ito.sol)). In the ITO, `qualification smart contract` acts as a plugin, and it is used to check if a user is qualified to participate. This document gives a brief introduction of `qualification smart contract` and shows how to use it with an example. Please keep in mind that the smart contract sample code is just for demonstration. The example needs to be tailored to fulfill your own requirement.

`Mask ERC20 token smart contract` is an ERC-20 compatible token smart contract. This test token smart contract includes `mint` functionality, which is convenient for developers.

`BalanceChecker` and `Multicall` are open source smart contracts(MIT License).

## `LuckyDraw qualification smart contract` Overview

Smart contract interface `IQLF` ([source code](https://github.com/DimensionDev/InitialTwitterOffering/blob/master/contracts/IQLF.sol)) is introduced to provide an API `logQualified()` that takes an address as input and returns a boolean indicating if the given address is qualified. If a user is not qualified, the `ITO main smart contract` will stop this user from participating an ITO(reverting a transaction). Customized `qualification contract` **SHOULD** implement contract `IQLF`. The deployed `qualification contract` address is required when a new ITO pool is created. Example: Ethereum mainnet [transaction](https://etherscan.io/tx/0xe27452456bdaa0e0dfdb099c5d8d94a15dd56d43568c80b479ad3018788783f8).

`LuckyDraw qualification smart contract`([source code](https://github.com/DimensionDev/qualification/blob/master/contracts/qualification_luckydraw.sol)) is an `IQLF` implementation example. `LuckyDraw qualification smart contract` is able to validate a variety of parameters(can be customized) during an ITO smart contract transaction:
- start time: the transaction will revert if `block.timestamp` is earlier than `start time`
- highest gas price: the transaction will revert if `tx.gasprice` exceeds the `highest gas price`
- token balance: a user needs to hold a specific amount of token: contract will revert if `IERC20(token_addr).balanceOf(account) < min_token_amount`
- lucky factor: chance of being selected as a lucky user, the transaction will revert if a user is not lucky enough
- white list: the transaction will bypass `token balance` validation if a user is on the white list
- blacklist: the transaction will revert if a user is on the blacklist

## Example

This section shows specifically how to use the `qualification smart contract` with an example. Suppose we have a requirement: a user needs to hold ≥1000 $MASK tokens to participate. Following parameters can be given when the smart contract is deployed.

```
start_time = 0;
// a very high gas price limit
max_gas_price = ethers.utils.parseUnits('100000', 'gwei');
// 1000 $MASK tokens, 18 is the token decimal
min_token_amount = ethers.utils.parseUnits("1000", 18);
// $MASK token mainnet contract address
token_addr = "0x69af81e73a73b40adf4f3d4223cd9b1ece623074";
// 100% lucky, bypass lucky draw feature. Another approach is simply getting rid of the validation from the source code.
lucky_factor = 0;
```

## Getting Started

This is a standard hardhat project.

To install required nodejs modules:
```shell
npm i
```

To build the project:
```
npm run compile
```

To run unit test:
```
npm run test:hardhat
```

To deploy the smart contract on ropsten testnet(including `QLF_LUCKYDRAW` smart contract):
```
npm run deploy:ropsten
```

To update deployed `QLF_LUCKYDRAW` smart contract whitelisted addresses:
```
npm run update_luckydraw_whitelist:ropsten
```

To validate whitelisted addresses in the deployed `QLF_LUCKYDRAW` smart contract :
```
npm run check_luckydraw_whitelist:ropsten
```

Note:
- Before you deploy a smart contract or interact with a smart contract, you need to set up your wallet private key and [`infura`](https://infura.io/) key in `project.secret.js`. `project.secret.sample.js` is a template, which contains dummy configurations. Please handle your private key carefully. In this project, `project.secret.js` has already been added into `.gitignore`, as a foolproof.
- `dataset/luckydrawWhitelist.json` is a sample of the whitelist config file.
- We just briefly showed how to use the `QLF_LUCKYDRAW` smart contract. For other smart contracts, please read the source code. It is obvious that this project is far from perfect. We will try our best to improve this project.

## Deployed Contract Address

### MaskToken - testnet only

| Chain | Address |
| ----- | ------- |
| Mainnet | N/A |
| Ropsten | [0x0f6d3eC1](https://ropsten.etherscan.io/address/0x0f6d3ec17ad4be4641fff47b98d970a2845c1365) |
| Rinkeby | [0x46ed2e50](https://rinkeby.etherscan.io/address/0x46ed2e50a9f27de0dc47b04e7580e8e91fce7246) |
| BSC-testnet | [0xC119574D](https://testnet.bscscan.com/address/0xC119574D5Fb333F5AC018658D4d8b5035E16bf39) |
| Matic-mumbai | [0xC119574D](https://explorer-mumbai.maticvigil.com/address/0xC119574D5Fb333F5AC018658D4d8b5035E16bf39) |


| Contract | [Mainnet](https://etherscan.io/) | [Ropsten](https://ropsten.etherscan.io/) | [BSC](https://bscscan.com/) |[BSC-testnet](https://testnet.bscscan.com/) | [Matic](https://matic.network/) | [Matic-mumbai](https://explorer-mumbai.maticvigil.com/) |
|---|---|---|---|---|---|---|
| [BalanceChecker](contracts/BalanceChecker.sol) | N/A | [0xD5C432dF](https://ropsten.etherscan.io/address/0xD5C432dFbDEcB6068583BC5241D1b308D70721a4) | [0xC119574D](https://bscscan.com/address/0xC119574D5Fb333F5AC018658D4d8b5035E16bf39) | [0x7f004a42](https://testnet.bscscan.com/address/0x7f004a42D760Eb68eB95Fa50f739917675181fCA) | [0x6cc1b105](https://explorer-mainnet.maticvigil.com/address/0x6cc1b1058F9153358278C35E0b2D382f1585854B) | [0xFEd05EE9](https://explorer-mumbai.maticvigil.com/address/0xFEd05EE9b7DdbAb97Abc55e27EF95C7c14688Aad) |
| [Multicall](contracts/Multicall.sol) | N/A | [0x69F47251](https://ropsten.etherscan.io/address/0x69F47251bAa9Ee4568Aba01Bc7B61720ba6caCef) | [0x41263cba(NOT deployed by MASK)](https://bscscan.com/address/0x41263cba59eb80dc200f3e2544eda4ed6a90e76c) | [0x6cc1b105](https://testnet.bscscan.com/address/0x6cc1b1058F9153358278C35E0b2D382f1585854B) | [0xC119574D](https://explorer-mainnet.maticvigil.com/address/0xC119574D5Fb333F5AC018658D4d8b5035E16bf39) | [0x6B70EC65](https://explorer-mumbai.maticvigil.com/address/0x6B70EC653c4331bdD0D0DCC7C941eb594e69a91d) |
| [QLF_LUCKYDRAW](contracts/luckydraw.sol) | N/A | [0xE7657599](https://ropsten.etherscan.io/address/0xE7657599B8323D50635FFaDA3a1302b3239c611b) | N/A | [0x2cB220F9](https://testnet.bscscan.com/address/0x2cB220F925E603A04BEE05F210252120deBA29d7) | N/A | [0x913975af](https://explorer-mumbai.maticvigil.com/address/0x913975af2Bb8a6Be4100D7dc5e9765B77F6A5d6c) |
| [QLF_SNAPSHOT](contracts/snapshot.sol) | N/A | [0xBf950671](https://ropsten.etherscan.io/address/0xBf9506714bDAd0ecc968804D1a5f1FD0Be2C8044) | N/A | [0xBf950671](https://testnet.bscscan.com/address/0xBf9506714bDAd0ecc968804D1a5f1FD0Be2C8044) | N/A | [0x2B0f2083](https://explorer-mumbai.maticvigil.com/address/0x2B0f2083be3Cea0B75d97B4993f0A99cDE1A1e61) |
| [QLF_DUMMY](contracts/dummy.sol) | N/A | [0x0061E06c](https://ropsten.etherscan.io/address/0x0061E06c9f640a03C4981f43762d2AE5e03873c5) | N/A | [0x0061E06c](https://testnet.bscscan.com/address/0x0061E06c9f640a03C4981f43762d2AE5e03873c5) | N/A | [0xe7a945e9](https://explorer-mumbai.maticvigil.com/address/0xe7a945e915E7c17f3263b03ac1bb84fb89410c3a) |
| [QLF_SNAPSHOT_WHITELIST](contracts/snapshot_whitelist.sol) | N/A | [0xf4f26308](https://ropsten.etherscan.io/address/0xf4f26308Bd5bb11152F4b921ebE4C45441c69230) | N/A | [0xf4f26308](https://testnet.bscscan.com/address/0xf4f26308Bd5bb11152F4b921ebE4C45441c69230) | N/A | [0x9b3649eC](https://explorer-mumbai.maticvigil.com/address/0x9b3649eC8C9f68484acC76D437B145a4e58Bf2A2) |


## Contribute

Any contribution is welcomed to make it more secure and powerful. Had you any questions, please do not hesitate to create an issue to let us know.

## License

InitialTwitterOffering is released under the [MIT LICENSE](LICENSE).