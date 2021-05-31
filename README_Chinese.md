# Mask Network Misc 合约集合

[English Version](./README.md)

## 简介

这个项目里包含了Mask Network目前在使用的一些零散的合约，包括`ITO qualification smart contracts`, `Mask ERC-20 token smart contract`, [BalanceChecker](https://github.com/wbobeirne/eth-balance-checker) and [Multicall](https://github.com/makerdao/multicall).

`Initial Twitter Offering (ITO) 资格审定合约`是`Mask Network ITO 主合约`的重要组成部分([source code](https://github.com/DimensionDev/InitialTwitterOffering/blob/master/contracts/ito.sol)). 在用户参与ITO过程中,`资格审定合约` 可以用来检查一个用户是否有资格参加此次ITO。这份文档简单介绍了`资格审定合约`，然后用一个例子来向您展示如何使用它。值得注意的是文档中的例子只是作为展示, 需要您针对具体需求进行修改。

`Mask ERC20 token smart contract` 是ERC-20兼容的token合约, 为了方便开发者，加入了mint代币的功能。

`BalanceChecker` and `Multicall`都是开源的合约(MIT License).

## 幸运抽签合约概述

我们的`Mask Network ITO 主合约`引入的接口`IQLF` ([source code](https://github.com/DimensionDev/InitialTwitterOffering/blob/master/contracts/IQLF.sol)) 包含了一个`logQualified()` API。 这个API的参数是用户钱包地址+开始时间，如果一个用户可以参加ITO,返回值是true, 否则会revert智能合约transaction(终止ITO)。一个克制化版本的`资鉴定合约` **需要** 实现 `IQLF`接口. 在发起一个ITO的时候，需要将`资格审定合约`的部署地址填写进去. 这里有一个例子: [主网transaction](https://etherscan.io/tx/0xe27452456bdaa0e0dfdb099c5d8d94a15dd56d43568c80b479ad3018788783f8).

您可以在`ITO资格审定合约`加入您感兴趣的内容，例如：`幸运抽签合约`([source code](https://github.com/DimensionDev/qualification/blob/master/contracts/qualification_luckydraw.sol))实现了`IQLF`接口，并加入了幸运抽签功能。 在一个用户参与ITO的时候，`幸运抽签合约`会通过以下参数来检查一个用户是否可以进行ITO:
- 开始时间: 如果用户在`开始时间`之前参与ITO，transaction会revert
- 最大gas price: 如果用户给了太高的gas price，transaction会revert(用意：阻止机器人用很高的gas price抢跑)
- 某个token的持仓量: 如果用户没有持有足够多数量的某个token，transaction会revert
- 幸运参数: 用户被选为幸运用户的幸运参数，如果一个用户某次ITO的时候不够幸运，transaction会revert
- 白名单: 如果一个用户地址在白名单里面，则不需要对token持仓量进行检查
- 黑名单: 如果一个用户地址在黑名单里面，这位用户参加ITO的时候，transaction会revert

## 一个实例

这一部分使用一个具体代码例子来展示如何使用`资格审定合约`。我们现在假定您有如下需求: 一个用户持有1000个$MASK才可以参加ITO，您在部署`幸运抽签合约`的时候给定如下参数即可满足您的需求：

```
start_time = 0;

// 很高的gas price限制(相当于无限制)
max_gas_price = ethers.utils.parseUnits('100000', 'gwei');

// 1000个$MASK, 18是$MASK的位数
min_token_amount = ethers.utils.parseUnits("1000", 18);

// $MASK主网合约地址
token_addr = "0x69af81e73a73b40adf4f3d4223cd9b1ece623074";

// 设置为0， 100%幸运, 也就是关闭了幸运抽奖功能
lucky_factor = 0;

// 对于您不需要的功能，另外一种方式是将进行检查的solidity代码从合约代码中删掉
```

## 简要教程

这是一个hardhat工程。

安装nodejs模块:
```shell
npm i
```

编译项目中的智能合约:
```
npm run compile
```

部署智能合约到ropsten测试网(包括`QLF_LUCKYDRAW`智能合约):
```
npm run deploy:ropsten
```

将白名单写入`QLF_LUCKYDRAW`智能合约:
```
npm run update_luckydraw_whitelist:ropsten
```

验证写入到`QLF_LUCKYDRAW`智能合约的白名单
```
npm run check_luckydraw_whitelist:ropsten
```

说明:
- 在您部署智能合约之前，您需要在`project.secret.js`文件中配置好您的钱包私钥和[`infura`](https://infura.io/) project key. `project.secret.sample.js`是一个模板文件。请小心处理您的私钥，本项目中的`.gitignore`已经包含`project.secret.js`, 以避免不小心将`project.secret.js`加入git仓库而泄露。
- `dataset/luckydrawWhitelist.json`文件里是一些做测试的白名单地址。
- 我们仅仅对包括`QLF_LUCKYDRAW`智能合约的用法进行了简单介绍，对于本项目中的其他智能合约，请仔细阅读源代码。由于时间有限，代码和文档都不完备，我们会努力逐步完善它们。

## 部署好的合约地址

| Contract | [Mainnet](https://etherscan.io/) | [Ropsten](https://ropsten.etherscan.io/) | [BSC](https://bscscan.com/) |[BSC-testnet](https://testnet.bscscan.com/) | [Matic](https://matic.network/) | [Matic-mumbai](https://explorer-mumbai.maticvigil.com/) |
|---|---|---|---|---|---|---|
| [MaskToken](contracts/MaskTestToken.sol) | N/A | [0x0f6d3eC1](https://ropsten.etherscan.io/address/0x0f6d3ec17ad4be4641fff47b98d970a2845c1365) | N/A | [0xC119574D](https://testnet.bscscan.com/address/0xC119574D5Fb333F5AC018658D4d8b5035E16bf39) | N/A | [0xC119574D](https://explorer-mumbai.maticvigil.com/address/0xC119574D5Fb333F5AC018658D4d8b5035E16bf39) |
| [BalanceChecker](contracts/BalanceChecker.sol) | N/A | [0xD5C432dF](https://ropsten.etherscan.io/address/0xD5C432dFbDEcB6068583BC5241D1b308D70721a4) | N/A | [0x7f004a42](https://testnet.bscscan.com/address/0x7f004a42D760Eb68eB95Fa50f739917675181fCA) | N/A | [0xFEd05EE9](https://explorer-mumbai.maticvigil.com/address/0xFEd05EE9b7DdbAb97Abc55e27EF95C7c14688Aad) |
| [Multicall](contracts/Multicall.sol) | N/A | [0x69F47251](https://ropsten.etherscan.io/address/0x69F47251bAa9Ee4568Aba01Bc7B61720ba6caCef) | N/A | [0x6cc1b105](https://testnet.bscscan.com/address/0x6cc1b1058F9153358278C35E0b2D382f1585854B) | N/A | [0x6B70EC65](https://explorer-mumbai.maticvigil.com/address/0x6B70EC653c4331bdD0D0DCC7C941eb594e69a91d) |
| [QLF_LUCKYDRAW](contracts/luckydraw.sol) | N/A | [0xE7657599](https://ropsten.etherscan.io/address/0xE7657599B8323D50635FFaDA3a1302b3239c611b) | N/A | [0x2cB220F9](https://testnet.bscscan.com/address/0x2cB220F925E603A04BEE05F210252120deBA29d7) | N/A | [0x913975af](https://explorer-mumbai.maticvigil.com/address/0x913975af2Bb8a6Be4100D7dc5e9765B77F6A5d6c) |
| [QLF_SNAPSHOT](contracts/snapshot.sol) | N/A | [0xBf950671](https://ropsten.etherscan.io/address/0xBf9506714bDAd0ecc968804D1a5f1FD0Be2C8044) | N/A | [0xBf950671](https://testnet.bscscan.com/address/0xBf9506714bDAd0ecc968804D1a5f1FD0Be2C8044) | N/A | [0x2B0f2083](https://explorer-mumbai.maticvigil.com/address/0x2B0f2083be3Cea0B75d97B4993f0A99cDE1A1e61) |
| [QLF_DUMMY](contracts/dummy.sol) | N/A | [0x0061E06c](https://ropsten.etherscan.io/address/0x0061E06c9f640a03C4981f43762d2AE5e03873c5) | N/A | [0x0061E06c](https://testnet.bscscan.com/address/0x0061E06c9f640a03C4981f43762d2AE5e03873c5) | N/A | [0xe7a945e9](https://explorer-mumbai.maticvigil.com/address/0xe7a945e915E7c17f3263b03ac1bb84fb89410c3a) |
| [QLF_SNAPSHOT_WHITELIST](contracts/snapshot_whitelist.sol) | N/A | [0xf4f26308](https://ropsten.etherscan.io/address/0xf4f26308Bd5bb11152F4b921ebE4C45441c69230) | N/A | [0xf4f26308](https://testnet.bscscan.com/address/0xf4f26308Bd5bb11152F4b921ebE4C45441c69230) | N/A | [0x9b3649eC](https://explorer-mumbai.maticvigil.com/address/0x9b3649eC8C9f68484acC76D437B145a4e58Bf2A2) |


## Contribute

这是一份开源软件，你的付出能让它变得更强大，更有用。如果您发现任何问题，请跟我们联系(请直接创建一个问题)。

## License

InitialTwitterOffering is released under the [MIT LICENSE](LICENSE).

