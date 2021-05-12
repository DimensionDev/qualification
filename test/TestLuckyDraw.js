const BigNumber = require('bignumber.js')
const chai = require('chai')
const expect = chai.expect
const assert = chai.assert
chai.use(require('chai-as-promised'))
const helper = require('./helper')

let snapshotId;

// TODO: add more test cases
describe('QLF_LUCKYDRAW', () => {
    before(async () => {
        signers = await ethers.getSigners()
        creator = signers[0]

    })

    beforeEach(async () => {
        snapshotId = await helper.takeSnapshot()
    })

    afterEach(async () => {
        await helper.revertToSnapShot(snapshotId)
    })

    it('Should variables initialized properly in contract creator', async () => {
        // 
    })

})
