const { ADDRESS_ZERO, setMasterContractApproval, createFixture, getBigNumber, advanceTime } = require("./utilities")
const { expect } = require("chai")
const { ethers } = require("hardhat")

let cmd, fixture

describe("MoneySink", function () {
    before(async function () {
        fixture = await createFixture(deployments, this, async (cmd) => {
            await cmd.deploy("goldnugget", "RevertingERC20Mock", "GOLN", "GOLN", 18, getBigNumber("10000000"))
            await cmd.deploy("weth9", "WETH9Mock")
            await cmd.deploy("alPine", "AlpineMock", this.weth9.address)
            await cmd.deploy("moneySink", "MoneySink", this.alPine.address, this.goldnugget.address)
            await this.moneySink.transferOwnership(this.alPine.address, true, false)
        })
        cmd = await fixture()
    })

    it("allows to set strategy", async function () {
        await this.alPine.setStrategy(this.goldnugget.address, this.moneySink.address)
        expect(await this.alPine.pendingStrategy(this.goldnugget.address)).to.be.equal(this.moneySink.address)
        await advanceTime(1209600, ethers)
        await this.alPine.setStrategy(this.goldnugget.address, this.moneySink.address)
        expect(await this.alPine.strategy(this.goldnugget.address)).to.be.equal(this.moneySink.address)
    })

    it("allows to set target for GoldNugget", async function () {
        await this.alPine.setStrategyTargetPercentage(this.goldnugget.address, 80)
        expect((await this.alPine.strategyData(this.goldnugget.address)).targetPercentage).to.be.equal(80)
    })

    it("should rebalance the token", async function () {
        await this.goldnugget.approve(this.alPine.address, getBigNumber(10))
        await this.alPine.deposit(this.goldnugget.address, this.alice.address, this.alice.address, getBigNumber(10), 0)
        expect((await this.alPine.strategyData(this.goldnugget.address)).balance).to.be.equal(0)
        await expect(this.alPine.harvest(this.goldnugget.address, true, getBigNumber(1)))
            .to.emit(this.alPine, "LogStrategyInvest")
            .withArgs(this.goldnugget.address, getBigNumber(1))
        await expect(this.alPine.harvest(this.goldnugget.address, true, getBigNumber(3)))
            .to.emit(this.alPine, "LogStrategyInvest")
            .withArgs(this.goldnugget.address, getBigNumber(3))
        await expect(this.alPine.harvest(this.goldnugget.address, true, getBigNumber(4)))
            .to.emit(this.alPine, "LogStrategyInvest")
            .withArgs(this.goldnugget.address, getBigNumber(4))
        expect((await this.alPine.strategyData(this.goldnugget.address)).balance).to.be.equal(getBigNumber(8))
    })

    it("tracks loss from harvest correctly", async function () {
        await this.moneySink.lose(getBigNumber(1))
        expect((await this.alPine.totals(this.goldnugget.address)).elastic).to.equal("10000000000000000000")
        await expect(this.alPine.harvest(this.goldnugget.address, false, 0))
            .to.emit(this.alPine, "LogStrategyLoss")
            .withArgs(this.goldnugget.address, getBigNumber(1))
        expect((await this.alPine.totals(this.goldnugget.address)).elastic).to.equal(getBigNumber(9))
    })

    it("switches to new strategy and exits from old", async function () {
        await cmd.deploy("moneySink2", "MoneySink", this.alPine.address, this.goldnugget.address)
        await this.alPine.setStrategy(this.goldnugget.address, this.moneySink2.address)
        await advanceTime(1209600, ethers)
        await this.alPine.setStrategy(this.goldnugget.address, this.moneySink2.address)
        expect(await this.goldnugget.balanceOf(this.alPine.address)).to.be.equal(getBigNumber(9))
        expect((await this.alPine.totals(this.goldnugget.address)).elastic).to.be.equal(getBigNumber(9))
    })

    it("holds correct asset after withdraw and harvest from Alpine", async function () {
        await this.moneySink2.transferOwnership(this.alPine.address, true, false)
        expect((await this.alPine.strategyData(this.goldnugget.address)).balance).to.be.equal(0)
        await this.alPine.harvest(this.goldnugget.address, true, 0)
        await this.alPine.withdraw(this.goldnugget.address, this.alice.address, this.alice.address, getBigNumber(1, 17), 0)
        expect((await this.alPine.strategyData(this.goldnugget.address)).balance).to.be.equal(getBigNumber(720, 16))
        await this.moneySink2.lose(getBigNumber(3))
        await this.alPine.harvest(this.goldnugget.address, false, 0)
        expect(await this.goldnugget.balanceOf(this.alPine.address)).to.be.equal(getBigNumber(170, 16))
        expect((await this.alPine.strategyData(this.goldnugget.address)).balance).to.be.equal(getBigNumber(420, 16))
        expect((await this.alPine.totals(this.goldnugget.address)).elastic).to.be.equal(getBigNumber(590, 16))
    })
})
