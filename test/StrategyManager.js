const { ADDRESS_ZERO, setMasterContractApproval, createFixture, getBigNumber, advanceTime } = require("./utilities")
const { expect } = require("chai")
const { ethers } = require("hardhat")

let cmd, fixture

describe("StrategyManager", function () {
    before(async function () {
        fixture = await createFixture(deployments, this, async (cmd) => {
            await cmd.deploy("goldnugget", "RevertingERC20Mock", "GOLN", "GOLN", 18, getBigNumber("10000000"))
            await cmd.deploy("weth9", "WETH9Mock")
            await cmd.deploy("alPine", "AlpineMock", this.weth9.address)
            await cmd.deploy("alchemybench", "AlchemyBenchMock", this.goldnugget.address)
            await cmd.deploy("goldnuggetStrategy", "GoldNuggetStrategy", this.alchemybench.address, this.goldnugget.address)
            await this.goldnuggetStrategy.transferOwnership(this.alPine.address, true, false)
            await this.goldnugget.approve(this.alchemybench.address, getBigNumber(1))
            await this.alchemybench.enter(getBigNumber(1))
        })
        cmd = await fixture()
    })

    describe("Strategy", function () {
        it("allows to set strategy", async function () {
            await this.alPine.setStrategy(this.goldnugget.address, this.goldnuggetStrategy.address)
            expect(await this.alPine.pendingStrategy(this.goldnugget.address)).to.be.equal(this.goldnuggetStrategy.address)
            await advanceTime(1209600, ethers)
            await this.alPine.setStrategy(this.goldnugget.address, this.goldnuggetStrategy.address)
            expect(await this.alPine.strategy(this.goldnugget.address)).to.be.equal(this.goldnuggetStrategy.address)
        })

        it("allows to set target for GoldNugget", async function () {
            await this.alPine.setStrategyTargetPercentage(this.goldnugget.address, 80)
            expect((await this.alPine.strategyData(this.goldnugget.address)).targetPercentage).to.be.equal(80)
        })

        it("reverts if target is too high", async function () {
            await expect(this.alPine.setStrategyTargetPercentage(this.goldnugget.address, 96)).to.be.revertedWith(
                "StrategyManager: Target too high"
            )
        })

        it("should rebalance the token", async function () {
            await this.goldnugget.approve(this.alPine.address, getBigNumber(10))
            await this.alPine.deposit(this.goldnugget.address, this.alice.address, this.alice.address, getBigNumber(10), 0)
            expect((await this.alPine.strategyData(this.goldnugget.address)).balance).to.be.equal(0)
            await this.alPine.harvest(this.goldnugget.address, true, 0)
            expect((await this.alPine.strategyData(this.goldnugget.address)).balance).to.be.equal(getBigNumber(8))
        })

        it("allows harvest of 0 when there's nothing to harvest", async function () {
            expect((await this.alPine.totals(this.goldnugget.address)).elastic).to.equal("10000000000000000000")
            await this.alPine.harvest(this.goldnugget.address, false, 0)
            expect((await this.alPine.totals(this.goldnugget.address)).elastic).to.equal("10000000000000000000")
        })

        it("rebalances correctly after AlchemyBench makes money", async function () {
            await this.goldnugget.transfer(this.alchemybench.address, getBigNumber(10))
            await this.alPine.harvest(this.goldnugget.address, true, 0)
            expect((await this.alPine.strategyData(this.goldnugget.address)).balance).to.be.equal("15111111111111111112")
            expect(await this.goldnugget.balanceOf(this.alPine.address)).to.be.equal("3777777777777777778")
        })

        it("switches to new strategy and exits from old", async function () {
            await cmd.deploy("goldnuggetStrategy2", "GoldNuggetStrategy", this.alchemybench.address, this.goldnugget.address)
            await this.alPine.setStrategy(this.goldnugget.address, this.goldnuggetStrategy2.address)
            await advanceTime(1209600, ethers)
            await this.alPine.setStrategy(this.goldnugget.address, this.goldnuggetStrategy2.address)
            expect(await this.goldnugget.balanceOf(this.alPine.address)).to.be.equal("18888888888888888888")
            expect((await this.alPine.totals(this.goldnugget.address)).elastic).to.be.equal("18888888888888888888")
        })

        it("GoldNuggetStrategy does not allow to draw a too high share", async function () {
            await this.goldnuggetStrategy2.withdraw(getBigNumber(1))
        })

        it("rebalances correctly after a withdraw from Alpine", async function () {
            await this.goldnuggetStrategy2.transferOwnership(this.alPine.address, true, false)
            await this.alPine.harvest(this.goldnugget.address, true, 0)
            await this.alPine.withdraw(this.goldnugget.address, this.alice.address, this.alice.address, "3677777777777777778", 0)
            await this.alPine.harvest(this.goldnugget.address, true, 0)
            expect(await this.goldnugget.balanceOf(this.alPine.address)).to.be.equal("3042222222222222220")
            expect((await this.alPine.totals(this.goldnugget.address)).elastic).to.be.equal("15211111111111111110")
        })

        it("switches to new strategy and exits from old with profit", async function () {
            await this.goldnugget.transfer(this.alchemybench.address, getBigNumber(1))
            await cmd.deploy("goldnuggetStrategy3", "GoldNuggetStrategy", this.alchemybench.address, this.goldnugget.address)
            await this.alPine.setStrategy(this.goldnugget.address, this.goldnuggetStrategy3.address)
            await advanceTime(1209600, ethers)
            await this.alPine.setStrategy(this.goldnugget.address, this.goldnuggetStrategy3.address)
            expect(await this.goldnugget.balanceOf(this.alPine.address)).to.be.equal("16063274198568316213")
            expect((await this.alPine.totals(this.goldnugget.address)).elastic).to.be.equal("16063274198568316213")
        })
    })
})
