const chai = require('chai');
chai.use(require('chai-as-promised'))
const helper = require('./helper')

const expect = chai.expect;
const assert = chai.assert;

let snapshotId;
const appContractName = 'QLF_LUCKYDRAW';
let appContract;

const tokenContractName = 'MaskToken';
let tokenContract;

const testTokenAContractName = 'TestTokenA';
let testTokenAContract;

let contractCreator;
let whitelisted_user_0;
let whitelisted_user_1;
let whitelisted_user_2;
let whitelisted_user_3;
// not whitelisted for testing
let user_0;
let user_1;
// blacklist
let blacklist_user_0;
let blacklist_user_1;
let whitelist;
let blacklist;
const nowTimeStamp = Math.floor(new Date().getTime() / 1000);
const abiCoder = new ethers.utils.AbiCoder();

const {
    qualification_event_encode,
    qualification_event_type,
    maskTokenInitialSupply,
    luckydraw_constructor_parameters,
    transaction_parameters
} = require('./constants')

describe(appContractName, () => {
    before(async () => {
        signers = await ethers.getSigners();
        contractCreator = signers[0];
        whitelisted_user_0 = signers[1];
        whitelisted_user_1 = signers[2];
        whitelisted_user_2 = signers[3];
        whitelisted_user_3 = signers[4];
        user_0 = signers[5];
        user_1 = signers[6];
        blacklist_user_0 = signers[7];
        blacklist_user_1 = signers[8];
        whitelist = [
            whitelisted_user_0.address,
            whitelisted_user_1.address,
            whitelisted_user_2.address,
            whitelisted_user_3.address,
        ];
        blacklist = [
            blacklist_user_0.address,
            blacklist_user_1.address,
        ];

        const maskTokenFactory = await ethers.getContractFactory(tokenContractName);
        const MASK = await maskTokenFactory.deploy(maskTokenInitialSupply);
        tokenContract = await MASK.deployed();

        luckydraw_constructor_parameters._token_addr = tokenContract.address;
        const appFactory = await ethers.getContractFactory(appContractName);
        const APP = await appFactory.deploy(...Object.values(luckydraw_constructor_parameters));
        appContract = await APP.deployed();

        const testTokenAFactory = await ethers.getContractFactory(testTokenAContractName);
        const testTokenA = await testTokenAFactory.deploy(maskTokenInitialSupply);
        testTokenAContract = await testTokenA.deployed();
    })

    beforeEach(async () => {
        snapshotId = await helper.takeSnapshot()
    })

    afterEach(async () => {
        await helper.revertToSnapShot(snapshotId)
    })

    it('Should contract initialized properly in constructor', async () => {
        expect(await appContract.name()).to.be.eq(appContractName);
        expect(await appContract.get_start_time()).to.be.eq(luckydraw_constructor_parameters._start_time);
        expect(await appContract.owner()).to.be.eq(contractCreator.address);
        expect(await appContract.max_gas_price()).to.be.eq(luckydraw_constructor_parameters._max_gas_price);
        expect(await appContract.min_token_amount()).to.be.eq(luckydraw_constructor_parameters._min_token_amount);
        expect(await appContract.token_addr()).to.be.eq(luckydraw_constructor_parameters._token_addr);
        expect(await appContract.lucky_factor()).to.be.eq(luckydraw_constructor_parameters._lucky_factor);
    })

    it('Should contract ownership work properly', async () => {
        {
            // not owner, can NOT this
            await expect(appContract.connect(whitelisted_user_0).set_start_time(0)).to.be.rejectedWith(Error);
            await expect(appContract.connect(whitelisted_user_0).set_max_gas_price(0)).to.be.rejectedWith(Error);
            await expect(appContract.connect(whitelisted_user_0).set_min_token_amount(0)).to.be.rejectedWith(Error);
            await expect(appContract.connect(whitelisted_user_0).set_lucky_factor(0)).to.be.rejectedWith(Error);
            await expect(appContract.connect(whitelisted_user_0).set_token_addr(appContract.address)).to.be.rejectedWith(Error);
            await expect(appContract.connect(whitelisted_user_0).add_whitelist(whitelist)).to.be.rejectedWith(Error);
            await expect(appContract.connect(whitelisted_user_0).remove_whitelist(whitelist)).to.be.rejectedWith(Error);
            await expect(appContract.connect(whitelisted_user_0).add_blacklist(blacklist)).to.be.rejectedWith(Error);
            await expect(appContract.connect(whitelisted_user_0).remove_blacklist(blacklist)).to.be.rejectedWith(Error);
        }
        {
            await appContract.connect(contractCreator).set_start_time(10);
            expect(await appContract.get_start_time()).to.be.eq(10);

            // transfer should work
            await expect(appContract.connect(whitelisted_user_0).transferOwnership(whitelisted_user_1.address)).to.be.rejectedWith(Error);
            await appContract.connect(contractCreator).transferOwnership(whitelisted_user_0.address);
            const newOwnwer = await appContract.owner();
            expect(newOwnwer).to.be.eq(whitelisted_user_0.address);

            // new owner can do this
            await appContract.connect(whitelisted_user_0).set_start_time(100);
            expect(await appContract.get_start_time()).to.be.eq(100);

            await appContract.connect(whitelisted_user_0).set_max_gas_price(0);
            expect(await appContract.max_gas_price()).to.be.eq(0);

            await appContract.connect(whitelisted_user_0).set_min_token_amount(10);
            expect(await appContract.min_token_amount()).to.be.eq(10);

            await appContract.connect(whitelisted_user_0).set_lucky_factor(2);
            expect(await appContract.lucky_factor()).to.be.eq(2);

            // this address is not valid(not ERC-20 token address), but good enough for testing
            await appContract.connect(whitelisted_user_0).set_token_addr(appContract.address);
            expect(await appContract.token_addr()).to.be.eq(appContract.address);
        }
    })

    it('Should white list work properly', async () => {
        {
            await expect(appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
            await expect(appContract.logQualified(whitelisted_user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
            await expect(appContract.logQualified(whitelisted_user_2.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
            await expect(appContract.logQualified(whitelisted_user_3.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
            await expect(appContract.logQualified(user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
            await expect(appContract.logQualified(user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);

            // add_whitelist should work
            await appContract.connect(contractCreator).add_whitelist(whitelist);

            // we just check the *emitted event of this transaction*
            await appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, transaction_parameters);
            {
                const logs = await ethers.provider.getLogs({
                    topics: [ethers.utils.keccak256(ethers.utils.toUtf8Bytes(qualification_event_encode))],
                })
                const qualification_event = abiCoder.decode(qualification_event_type, logs[0].data);
                expect(qualification_event).to.have.property('account').that.to.be.eq(whitelisted_user_0.address);
                expect(qualification_event).to.have.property('qualified').that.to.be.eq(true);
                expect(qualification_event).to.have.property('blocknumber');
                expect(qualification_event).to.have.property('timestamp');
            }
            // we think the transaction is good if it is not rejected
            await appContract.logQualified(whitelisted_user_1.address, nowTimeStamp, transaction_parameters);
            await appContract.logQualified(whitelisted_user_2.address, nowTimeStamp, transaction_parameters);
            await appContract.logQualified(whitelisted_user_3.address, nowTimeStamp, transaction_parameters);
            await expect(appContract.logQualified(user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
            await expect(appContract.logQualified(user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        }
        {
            // remove_whitelist should work
            const testWhitelist = [whitelisted_user_0.address, whitelisted_user_1.address];
            await appContract.connect(contractCreator).remove_whitelist(testWhitelist);
            await expect(appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
            await expect(appContract.logQualified(whitelisted_user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
            await appContract.logQualified(whitelisted_user_2.address, nowTimeStamp, transaction_parameters);
            await appContract.logQualified(whitelisted_user_3.address, nowTimeStamp, transaction_parameters);
            await expect(appContract.logQualified(user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
            await expect(appContract.logQualified(user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        }
    })

    it('Should blacklist work properly', async () => {
        await expect(appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(whitelisted_user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(whitelisted_user_2.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(whitelisted_user_3.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(blacklist_user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(blacklist_user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);

        await tokenContract.transfer(whitelisted_user_0.address, luckydraw_constructor_parameters._min_token_amount);
        await tokenContract.transfer(whitelisted_user_1.address, luckydraw_constructor_parameters._min_token_amount);
        await tokenContract.transfer(whitelisted_user_2.address, luckydraw_constructor_parameters._min_token_amount);
        await tokenContract.transfer(whitelisted_user_3.address, luckydraw_constructor_parameters._min_token_amount);
        await tokenContract.transfer(user_0.address, luckydraw_constructor_parameters._min_token_amount);
        await tokenContract.transfer(user_1.address, luckydraw_constructor_parameters._min_token_amount);
        await tokenContract.transfer(blacklist_user_0.address, luckydraw_constructor_parameters._min_token_amount);
        await tokenContract.transfer(blacklist_user_1.address, luckydraw_constructor_parameters._min_token_amount);

        await appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, transaction_parameters);
        await appContract.logQualified(whitelisted_user_1.address, nowTimeStamp, transaction_parameters);
        await appContract.logQualified(whitelisted_user_2.address, nowTimeStamp, transaction_parameters);
        await appContract.logQualified(whitelisted_user_3.address, nowTimeStamp, transaction_parameters);
        await appContract.logQualified(user_0.address, nowTimeStamp, transaction_parameters);
        await appContract.logQualified(user_1.address, nowTimeStamp, transaction_parameters);
        await appContract.logQualified(blacklist_user_0.address, nowTimeStamp, transaction_parameters);
        await appContract.logQualified(blacklist_user_1.address, nowTimeStamp, transaction_parameters);

        await appContract.add_blacklist(blacklist);
        await expect(appContract.logQualified(blacklist_user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(blacklist_user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);

        const testBlacklist = [blacklist_user_0.address]
        await appContract.remove_blacklist(testBlacklist);
        await appContract.logQualified(blacklist_user_0.address, nowTimeStamp, transaction_parameters);
        await expect(appContract.logQualified(blacklist_user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
    })

    it('Should token balance checker work properly', async () => {
        // 10 times
        const increasedAmount = luckydraw_constructor_parameters._min_token_amount.mul(10);

        await expect(appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(whitelisted_user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(whitelisted_user_2.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(whitelisted_user_3.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);

        // transfer a certain amount of tokens
        await tokenContract.transfer(whitelisted_user_0.address, luckydraw_constructor_parameters._min_token_amount);
        await tokenContract.transfer(whitelisted_user_1.address, increasedAmount);
        await tokenContract.transfer(whitelisted_user_2.address, luckydraw_constructor_parameters._min_token_amount.add(1));
        await tokenContract.transfer(whitelisted_user_3.address, luckydraw_constructor_parameters._min_token_amount.sub(1));

        await appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, transaction_parameters);
        await appContract.logQualified(whitelisted_user_1.address, nowTimeStamp, transaction_parameters);
        await appContract.logQualified(whitelisted_user_2.address, nowTimeStamp, transaction_parameters);
        await expect(appContract.logQualified(whitelisted_user_3.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);

        await appContract.set_min_token_amount(increasedAmount);
        await expect(appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await appContract.logQualified(whitelisted_user_1.address, nowTimeStamp, transaction_parameters);
        await expect(appContract.logQualified(whitelisted_user_2.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(whitelisted_user_3.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);

        await appContract.set_token_addr(testTokenAContract.address);
        // transfer a certain amount of test token A
        await testTokenAContract.transfer(whitelisted_user_0.address, increasedAmount);
        await testTokenAContract.transfer(whitelisted_user_1.address, increasedAmount);
        await appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, transaction_parameters);
        await appContract.logQualified(whitelisted_user_1.address, nowTimeStamp, transaction_parameters);
        await expect(appContract.logQualified(whitelisted_user_2.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(whitelisted_user_3.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
        await expect(appContract.logQualified(user_1.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);
    })

    it('Should gas price limit work properly', async () => {
        const local_transaction_parameters = JSON.parse(JSON.stringify(transaction_parameters));
        // default should work
        await tokenContract.transfer(whitelisted_user_0.address, luckydraw_constructor_parameters._min_token_amount);
        await appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, local_transaction_parameters);
        local_transaction_parameters.gasPrice = luckydraw_constructor_parameters._max_gas_price.sub(1);
        await appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, local_transaction_parameters);

        local_transaction_parameters.gasPrice = luckydraw_constructor_parameters._max_gas_price.add(1);
        await expect(appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, local_transaction_parameters)).to.be.rejectedWith(Error);

        await appContract.set_max_gas_price(local_transaction_parameters.gasPrice);
        await appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, local_transaction_parameters);
    })

    it('Should start-time limit work properly', async () => {
        await tokenContract.transfer(whitelisted_user_0.address, luckydraw_constructor_parameters._min_token_amount);
        await appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, transaction_parameters);

        // not started
        const advanceTime = 100;
        await appContract.set_start_time(nowTimeStamp + advanceTime);
        await expect(appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, transaction_parameters)).to.be.rejectedWith(Error);

        await helper.advanceTimeAndBlock(advanceTime)
        await appContract.logQualified(whitelisted_user_0.address, nowTimeStamp, transaction_parameters);
    })

    it('Should lucky-factor work properly', async () => {
        const randomAccountList = [];
        const totalAcount = 100;
        for (let i = 0; i < totalAcount; i++) {
            const randomWallet = ethers.Wallet.createRandom();
            randomAccountList.push(randomWallet);
            // some transactions to increase blocknumer, otherwise, transaction would revert in `isLucky()` because of integer overflow
            await tokenContract.transfer(randomAccountList[i].address, luckydraw_constructor_parameters._min_token_amount);
            await tokenContract.transfer(randomAccountList[i].address, luckydraw_constructor_parameters._min_token_amount);
            await tokenContract.transfer(randomAccountList[i].address, luckydraw_constructor_parameters._min_token_amount);
            await tokenContract.transfer(randomAccountList[i].address, luckydraw_constructor_parameters._min_token_amount);
        }

        // default is 0; every account should be lucky
        for (let i = 0; i < totalAcount; i++) {
            expect(await appContract.isLucky(randomAccountList[i].address)).to.be.true;
        }
        await appContract.set_lucky_factor(4);
        for (let i = 0; i < totalAcount; i++) {
            expect(await appContract.isLucky(randomAccountList[i].address)).to.be.false;
        }

        await appContract.set_lucky_factor(2);
        {
            let luckyPlayerCount = 0;
            for (let i = 0; i < totalAcount; i++) {
                const ret = await appContract.isLucky(randomAccountList[i].address);
                if (ret) {
                    luckyPlayerCount = luckyPlayerCount + 1;
                }
            }
            console.log(luckyPlayerCount);
            expect(luckyPlayerCount >= 40).to.be.true;
            expect(luckyPlayerCount <= 60).to.be.true;
        }
    })
})
