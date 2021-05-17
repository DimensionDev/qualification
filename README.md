# Mask Network ITO qualification smart contract

[中文版](./README_Chinese.md)

## Introduction

`Initial Twitter Offering (ITO) qualification smart contract` is an important part of `Mask Network ITO main smart contract`([source code](https://github.com/DimensionDev/InitialTwitterOffering/blob/master/contracts/ito.sol)). In the ITO, `qualification smart contract` acts as a plugin, and it is used to check if a user is qualified to participate. This document gives a brief introduction of `qualification smart contract` and shows how to use it with an example. Please keep in mind that the smart contract sample code is just for demonstration. The example needs to be tailored to fulfill your own requirement.

## Overview

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
## Contract Address

### ITO Contract

| Chain | Address |
| ----- | ------- |
| Mainnet | [0xf110fec3075d7531141b6bf16b11604cb028a17b](https://etherscan.io/address/0xf110fec3075d7531141b6bf16b11604cb028a17b) |
| Ropsten | N/A |
| Rinkeby | N/A |
| Kovan | N/A |
| Görli | N/A |

### LuckyDraw Qualification Contract

| Chain | Address |
| ----- | ------- |
| Mainnet | [0x3998599c011e226B36E88A46b6331e81A86540B1](https://etherscan.io/address/0x3998599c011e226B36E88A46b6331e81A86540B1) |
| Ropsten | N/A |
| Rinkeby | N/A |
| Kovan | N/A |
| Görli | N/A |

## Contribute

Any contribution is welcomed to make it more secure and powerful. Had you any questions, please do not hesitate to create an issue to let us know.

## License

InitialTwitterOffering is released under the [MIT LICENSE](LICENSE).

