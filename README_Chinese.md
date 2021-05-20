# Mask Network ITO 资格审定合约

[English Version](./README.md)

## 简介

`Initial Twitter Offering (ITO) 资格审定合约`是`Mask Network ITO 主合约`的重要组成部分([source code](https://github.com/DimensionDev/InitialTwitterOffering/blob/master/contracts/ito.sol)). 在用户参与ITO过程中,`资格审定合约` 可以用来检查一个用户是否有资格参加此次ITO。这份文档简单介绍了`资格审定合约`，然后用一个例子来向您展示如何使用它。值得注意的是文档中的例子只是作为展示, 需要您针对具体需求进行修改。

## 概述

我们的`Mask Network ITO 主合约`引入的接口`IQLF` ([source code](https://github.com/DimensionDev/InitialTwitterOffering/blob/master/contracts/IQLF.sol)) 包含了一个`logQualified()` API。 这个API的参数是用户钱包地址+开始时间，如果一个用户可以参加ITO,返回值是true, 否则会revert智能合约transaction(终止ITO)。一个克制化版本的`资鉴定合约` **需要** 实现 `IQLF`接口. 在发起一个ITO的时候，需要将`资格审定合约`的部署地址填写进去. 这里有一个例子: [主网transaction](https://etherscan.io/tx/0xe27452456bdaa0e0dfdb099c5d8d94a15dd56d43568c80b479ad3018788783f8).

您可以在`ITO资格审定合约`加入您感兴趣的内容，例如：`幸运抽签合约`([source code](https://github.com/DimensionDev/qualification/blob/master/contracts/qualification_luckydraw.sol))实现了`IQLF`接口，并加入了幸运抽签功能。 在一个用户参与ITO的时候，`幸运抽签合约`会通过以下参数来检查一个用户是否可以进行ITO:
- 开始时间: 如果用户在`开始时间`之前参与ITO，transaction会revert
- 最大gas price: 如果用户给了太高的gas price，transaction会revert(用意：阻止机器人用很高的gas price抢跑)
- 某个token的持仓量: 如果用户没有持有足够多数量的某个token，transaction会revert
- 幸运参数: 用户被选为幸运用户的幸运参数，如果一个用户某次ITO的时候不够幸运，transaction会revert
- 白名单: 如果一个用户地址在白名单里面，则不需要对token持仓量进行检查
- 黑名单: 如果一个用户地址在黑名单里面，这位用户参加ITO的时候，transaction会revert

## 一个实例

这一部分使用一个具体代码例子来展示如何使用`资格审定合约`。我们现在假定您有如下需求: 一个用户持有1000个$MASK才可以参加ITO，您在部署`幸运抽签合约`的时候给定如下参数即可达到要求：

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
- 我们仅仅对包括`QLF_LUCKYDRAW`智能合约的用法进行了简单介绍，对于本项目中的其他智能合约，请仔细阅读源代码。

## 合约地址

### ITO 合约

| 网络 | 地址 |
| ----- | ------- |
| 主网 | [0xf110fec3075d7531141b6bf16b11604cb028a17b](https://etherscan.io/address/0xf110fec3075d7531141b6bf16b11604cb028a17b) |
| Ropsten | N/A |
| Rinkeby | N/A |
| Kovan | N/A |
| Görli | N/A |

### 幸运抽签合约

| 网络 | 地址 |
| ----- | ------- |
| Mainnet | [0x3998599c011e226B36E88A46b6331e81A86540B1](https://etherscan.io/address/0x3998599c011e226B36E88A46b6331e81A86540B1) |
| Ropsten | N/A |
| Rinkeby | N/A |
| Kovan | N/A |
| Görli | N/A |

## Contribute

这是一份开源软件，你的付出能让它变得更强大，更有用。如果您发现任何问题，请跟我们联系(请直接创建一个问题)。

## License

InitialTwitterOffering is released under the [MIT LICENSE](LICENSE).

