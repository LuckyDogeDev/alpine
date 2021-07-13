const { ethers, deployments, getChainId } = require("hardhat")
const { expect, assert } = require("chai")
const {
    getApprovalDigest,
    prepare,
    ADDRESS_ZERO,
    getBigNumber,
    sansSafetyAmount,
    setMasterContractApproval,
    deploy,
    deploymentsFixture,
    decodeLogs,
    advanceTime,
    weth,
    createFixture,
} = require("./utilities")

const { ecsign } = require("ethereumjs-util")
let cmd, fixture

// extreme volumes to explicitly test flashmint overflow vectors
const bigInt = require("big-integer")
const extremeValidVolume = bigInt(2).pow(127)
const alpProtocolLimit = bigInt(2).pow(128).minus(1)
const computationalLimit = bigInt(2).pow(256).minus(1)

describe("Alpine", function () {
    before(async function () {
        fixture = await createFixture(deployments, this, async (cmd) => {
            await cmd.deploy("weth9", "WETH9Mock")
            await cmd.deploy("alPine", "AlpineMock", this.weth9.address)

            await cmd.addToken("a", "Token A", "A", 18)
            await cmd.addToken("b", "Token B", "B", 6, "RevertingERC20Mock")
            await cmd.addToken("c", "Token C", "C", 8, "RevertingERC20Mock")

            await cmd.deploy("flashLoaner", "FlashLoanerMock")
            await cmd.deploy("sneakyFlashLoaner", "SneakyFlashLoanerMock")
            await cmd.deploy("strategy", "SimpleStrategyMock", this.alPine.address, this.a.address)

            await this.alPine.setStrategy(this.a.address, this.strategy.address)
            await advanceTime(1209600, ethers)
            await this.alPine.setStrategy(this.a.address, this.strategy.address)
            await this.alPine.setStrategyTargetPercentage(this.a.address, 20)

            await cmd.deploy("erc20", "ERC20Mock", 10000000)
            await cmd.deploy("masterContractMock", "MasterContractMock", this.alPine.address)

            this.a.approve = function (...params) {
                console.log(params)
                this.a.approve(...params)
            }
            await this.a.connect(this.fred).approve(this.alPine.address, getBigNumber(130))
            await expect(this.alPine.connect(this.fred).deposit(this.a.address, this.fred.address, this.fred.address, getBigNumber(100), 0))
                .to.emit(this.a, "Transfer")
                .withArgs(this.fred.address, this.alPine.address, getBigNumber(100))
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.a.address, this.fred.address, this.fred.address, getBigNumber(100), getBigNumber(100))

            this.alPine.connect(this.fred).addProfit(this.a.address, getBigNumber(30))

            await this.b.connect(this.fred).approve(this.alPine.address, getBigNumber(400, 6))
            await expect(this.alPine.connect(this.fred).deposit(this.b.address, this.fred.address, this.fred.address, getBigNumber(200, 6), 0))
                .to.emit(this.b, "Transfer")
                .withArgs(this.fred.address, this.alPine.address, getBigNumber(200, 6))
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.b.address, this.fred.address, this.fred.address, getBigNumber(200, 6), getBigNumber(200, 6))

            this.alPine.connect(this.fred).addProfit(this.b.address, getBigNumber(200, 6))

            await this.alPine.harvest(this.a.address, true, 0)
        })
    })

    beforeEach(async function () {
        cmd = await fixture()
    })

    describe("Deploy", function () {
        it("Emits LogDeploy event with correct arguments", async function () {
            const data = "0x00"

            await expect(this.alPine.deploy(this.masterContractMock.address, data, true)).to.emit(this.alPine, "LogDeploy")
        })
    })

    describe("Conversion", function () {
        it("Should convert Shares to Amounts", async function () {
            await this.AlpineMock.new("alp", this.weth9.address)

            expect(await this.alp.toShare(this.a.address, 1000, false)).to.be.equal(1000)
            expect(await this.alp.toShare(this.a.address, 1, false)).to.be.equal(1)
            expect(await this.alp.toShare(this.a.address, 0, false)).to.be.equal(0)
            expect(await this.alp.toShare(this.a.address, 1000, true)).to.be.equal(1000)
            expect(await this.alp.toShare(this.a.address, 1, true)).to.be.equal(1)
            expect(await this.alp.toShare(this.a.address, 0, true)).to.be.equal(0)
            expect(await this.alp.toShare(this.a.address, extremeValidVolume.toString(), false)).to.be.equal(extremeValidVolume.toString())
            expect(await this.alp.toShare(this.a.address, alpProtocolLimit.toString(), false)).to.be.equal(alpProtocolLimit.toString())
            expect(await this.alp.toShare(this.a.address, computationalLimit.toString(), false)).to.be.equal(computationalLimit.toString())
            expect(await this.alp.toShare(this.a.address, extremeValidVolume.toString(), true)).to.be.equal(extremeValidVolume.toString())
            expect(await this.alp.toShare(this.a.address, alpProtocolLimit.toString(), true)).to.be.equal(alpProtocolLimit.toString())
            expect(await this.alp.toShare(this.a.address, computationalLimit.toString(), true)).to.be.equal(computationalLimit.toString())
        })

        it("Should convert amount to Shares", async function () {
            await this.AlpineMock.new("alp", this.weth9.address)

            expect(await this.alp.toAmount(this.a.address, 1000, false)).to.be.equal(1000)
            expect(await this.alp.toAmount(this.a.address, 1, false)).to.be.equal(1)
            expect(await this.alp.toAmount(this.a.address, 0, false)).to.be.equal(0)
            expect(await this.alp.toAmount(this.a.address, 1000, true)).to.be.equal(1000)
            expect(await this.alp.toAmount(this.a.address, 1, true)).to.be.equal(1)
            expect(await this.alp.toAmount(this.a.address, 0, true)).to.be.equal(0)
            expect(await this.alp.toAmount(this.a.address, extremeValidVolume.toString(), false)).to.be.equal(extremeValidVolume.toString())
            expect(await this.alp.toAmount(this.a.address, alpProtocolLimit.toString(), false)).to.be.equal(alpProtocolLimit.toString())
            expect(await this.alp.toAmount(this.a.address, computationalLimit.toString(), false)).to.be.equal(computationalLimit.toString())
            expect(await this.alp.toAmount(this.a.address, extremeValidVolume.toString(), true)).to.be.equal(extremeValidVolume.toString())
            expect(await this.alp.toAmount(this.a.address, alpProtocolLimit.toString(), true)).to.be.equal(alpProtocolLimit.toString())
            expect(await this.alp.toAmount(this.a.address, computationalLimit.toString(), true)).to.be.equal(computationalLimit.toString())
        })

        it("Should convert at ratio", async function () {
            await this.AlpineMock.new("alp", this.weth9.address)
            await this.a.approve(this.alp.address, getBigNumber(166))

            await this.alp.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(100), 0)
            await this.alp.addProfit(this.a.address, getBigNumber(66))

            expect(await this.alp.toAmount(this.a.address, 1000, false)).to.be.equal(1660)
            expect(await this.alp.toAmount(this.a.address, 1, false)).to.be.equal(1)
            expect(await this.alp.toAmount(this.a.address, 0, false)).to.be.equal(0)
            expect(await this.alp.toAmount(this.a.address, 1000, true)).to.be.equal(1660)
            expect(await this.alp.toAmount(this.a.address, 1, true)).to.be.equal(2)
            expect(await this.alp.toAmount(this.a.address, 0, true)).to.be.equal(0)
            // 1000 * 100 / 166 = 602.4096
            expect(await this.alp.toShare(this.a.address, 1000, false)).to.be.equal(602)
            expect(await this.alp.toShare(this.a.address, 1000, true)).to.be.equal(603)
            expect(await this.alp.toShare(this.a.address, 1, false)).to.be.equal(0)
            expect(await this.alp.toShare(this.a.address, 1, true)).to.be.equal(1)
            expect(await this.alp.toShare(this.a.address, 0, false)).to.be.equal(0)
            expect(await this.alp.toShare(this.a.address, 0, true)).to.be.equal(0)

            expect(await this.alp.toShare(this.a.address, extremeValidVolume.toString(), false)).to.be.equal(
                bigInt(extremeValidVolume).multiply(100).divide(166).toString()
            )
            expect(await this.alp.toShare(this.a.address, alpProtocolLimit.toString(), false)).to.be.equal(
                bigInt(alpProtocolLimit).multiply(100).divide(166).toString()
            )
            await expect(this.alp.toShare(this.a.address, computationalLimit.toString(), false)).to.be.revertedWith("BoringMath: Mul Overflow")
        })
    })

    describe("Extreme approvals", function () {
        it("approval succeeds with extreme but valid amount", async function () {
            await expect(this.a.approve(this.alp.address, extremeValidVolume.toString()))
                .to.emit(this.a, "Approval")
                .withArgs(this.alice.address, this.alp.address, extremeValidVolume.toString())
        })

        it("approval succeeds with alp protocol limit", async function () {
            await expect(this.a.approve(this.alp.address, alpProtocolLimit.toString()))
                .to.emit(this.a, "Approval")
                .withArgs(this.alice.address, this.alp.address, alpProtocolLimit.toString())
        })

        it("approval succeeds with computational limit", async function () {
            await expect(this.a.approve(this.alp.address, computationalLimit.toString()))
                .to.emit(this.a, "Approval")
                .withArgs(this.alice.address, this.alp.address, computationalLimit.toString())
        })
    })

    describe("Deposit", function () {
        it("Reverts with to address zero", async function () {
            await expect(this.alPine.deposit(this.a.address, this.alice.address, ADDRESS_ZERO, 0, 0)).to.be.revertedWith(
                "Alpine: to not set"
            )
            await expect(this.alPine.deposit(ADDRESS_ZERO, this.alice.address, ADDRESS_ZERO, 0, 0)).to.be.revertedWith("Alpine: to not set")
            await expect(this.alPine.deposit(this.a.address, this.bob.address, ADDRESS_ZERO, 1, 0)).to.be.revertedWith(
                "Alpine: no masterContract"
            )
        })

        it("Reverts on deposit - extreme volume at computational limit", async function () {
            await this.a.approve(this.alPine.address, computationalLimit.toString())
            await expect(
                this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, computationalLimit.toString(), 0)
            ).to.be.revertedWith("BoringMath: Mul Overflow")
        })

        it("Reverts on deposit - extreme volume at alp protocol limit", async function () {
            await this.a.approve(this.alPine.address, alpProtocolLimit.toString())
            await expect(
                this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, alpProtocolLimit.toString(), 0)
            ).to.be.revertedWith("BoringMath: Add Overflow")
        })

        it("Reverts on deposit - extreme volume, below alp protocol limit, but above available reserves", async function () {
            await this.a.approve(this.alPine.address, extremeValidVolume.toString())
            await expect(
                this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, extremeValidVolume.toString(), 0)
            ).to.be.revertedWith("BoringERC20: TransferFrom failed")
        })

        it("Reverts without approval", async function () {
            await this.a.connect(this.bob).approve(this.alPine.address, 1000)
            await expect(this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, 100, 0)).to.be.revertedWith(
                "BoringERC20: TransferFrom failed"
            )
            await expect(this.alPine.deposit(this.a.address, this.alice.address, this.bob.address, 100, 0)).to.be.revertedWith(
                "BoringERC20: TransferFrom failed"
            )
            await expect(
                this.alPine.deposit(this.a.address, this.alice.address, this.bob.address, alpProtocolLimit.toString(), 0)
            ).to.be.revertedWith("BoringMath: Add Overflow")
            await expect(
                this.alPine.deposit(this.a.address, this.alice.address, this.bob.address, computationalLimit.toString(), 0)
            ).to.be.revertedWith("BoringMath: Mul Overflow")
            await expect(this.alPine.connect(this.bob).deposit(this.b.address, this.bob.address, this.bob.address, 100, 0)).to.be.revertedWith(
                "BoringERC20: TransferFrom failed"
            )
            expect(await this.alPine.balanceOf(this.a.address, this.alice.address)).to.be.equal(0)
        })

        it("Mutates balanceOf correctly", async function () {
            await this.c.approve(this.alPine.address, 1000)
            await expect(this.alPine.deposit(this.c.address, this.alice.address, this.alice.address, 1, 0)).to.not.emit(this.c, "Transfer")
            await expect(this.alPine.deposit(this.c.address, this.alice.address, this.alice.address, 999, 0)).to.not.emit(this.c, "Transfer")
            await expect(this.alPine.deposit(this.c.address, this.alice.address, this.alice.address, 0, 1000)).to.emit(this.c, "Transfer")

            await this.a.approve(this.alPine.address, 1000)

            await expect(this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, 130, 0))
                .to.emit(this.a, "Transfer")
                .withArgs(this.alice.address, this.alPine.address, "130")
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.a.address, this.alice.address, this.alice.address, "130", "100")

            expect(await this.alPine.balanceOf(this.a.address, this.alice.address)).to.be.equal(100)
            expect(await this.alPine.balanceOf(this.a.address, this.alice.address)).to.be.equal(100)
        })

        it("Mutates balanceOf for Alpine and WETH correctly", async function () {
            await this.weth9.connect(this.alice).deposit({ value: 1000 })
            await expect(
                this.alPine.connect(this.bob).deposit(ADDRESS_ZERO, this.bob.address, this.bob.address, 1, 0, { value: 1 })
            ).to.not.emit(this.weth9, "Deposit")
            await expect(this.alPine.connect(this.bob).deposit(ADDRESS_ZERO, this.bob.address, this.bob.address, 1000, 0, { value: 1000 }))
                .to.emit(this.weth9, "Deposit")
                .withArgs(this.alPine.address, "1000")
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.weth9.address, this.bob.address, this.bob.address, "1000", "1000")

            expect(await this.weth9.balanceOf(this.alPine.address), "Alpine should hold WETH").to.be.equal(1000)
            expect(await this.alPine.balanceOf(this.weth9.address, this.bob.address), "bob should have weth").to.be.equal(1000)
        })

        it("Reverts if TotalSupply of token is Zero or if token isn't a token", async function () {
            await expect(
                this.alPine.connect(this.bob).deposit(ADDRESS_ZERO, this.bob.address, this.bob.address, 1, 0, { value: 1 })
            ).to.be.revertedWith("Alpine: No tokens")
            await expect(
                this.alPine.connect(this.bob).deposit(this.alPine.address, this.bob.address, this.bob.address, 1, 0, { value: 1 })
            ).to.be.revertedWith("Transaction reverted: function selector was not recognized and there's no fallback function")
        })

        it("Mutates balanceOf and totalSupply for two deposits correctly", async function () {
            await this.a.approve(this.alPine.address, getBigNumber(1200))

            await expect(this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(100), 0))
                .to.emit(this.a, "Transfer")
                .withArgs(this.alice.address, this.alPine.address, getBigNumber(100))
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.a.address, this.alice.address, this.alice.address, getBigNumber(100), "76923076923076923076") // 100 * 1000 / 1300 = 76.923

            await expect(this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(200), 0))
                .to.emit(this.a, "Transfer")
                .withArgs(this.alice.address, this.alPine.address, getBigNumber(200))
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.a.address, this.alice.address, this.alice.address, getBigNumber(200), "153846153846153846153")
            // 200 * 176923076923076923076 / 230000000000000000000 = 153.846153846153846153

            expect(await this.alPine.balanceOf(this.a.address, this.alice.address), "incorrect amount calculation").to.be.equal(
                "230769230769230769229"
            )
            // 76923076923076923076 + 153846153846153846153 = 230769230769230769229
            expect((await this.alPine.totals(this.a.address)).elastic, "incorrect total amount").to.be.equal(getBigNumber(430))
            // 130 + 100 + 200 = 430

            await expect(this.alPine.deposit(this.a.address, this.alice.address, this.bob.address, getBigNumber(400), 0))
                .to.emit(this.a, "Transfer")
                .withArgs(this.alice.address, this.alPine.address, getBigNumber(400))
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.a.address, this.alice.address, this.bob.address, getBigNumber(400), "307692307692307692306")

            await expect(this.alPine.deposit(this.a.address, this.alice.address, this.bob.address, getBigNumber(500), 0))
                .to.emit(this.a, "Transfer")
                .withArgs(this.alice.address, this.alPine.address, getBigNumber(500))
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.a.address, this.alice.address, this.bob.address, getBigNumber(500), "384615384615384615382")

            expect(await this.alPine.balanceOf(this.a.address, this.bob.address), "incorrect amount calculation").to.be.equal(
                "692307692307692307688"
            )
            expect((await this.alPine.totals(this.a.address)).elastic, "incorrect total amount").to.be.equal(getBigNumber(1330))
        })

        it("Emits LogDeposit event with correct arguments", async function () {
            await this.a.approve(this.alPine.address, 100)

            await expect(this.alPine.deposit(this.a.address, this.alice.address, this.bob.address, 100, 0))
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.a.address, this.alice.address, this.bob.address, 100, 76)
        })
    })

    describe("Deposit Share", function () {
        it("allows for deposit of Share", async function () {
            await this.a.approve(this.alPine.address, 2)
            await expect(this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, 0, 1))
                .to.emit(this.a, "Transfer")
                .withArgs(this.alice.address, this.alPine.address, "2")
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.a.address, this.alice.address, this.alice.address, "2", "1")
            expect(await this.alPine.balanceOf(this.a.address, this.alice.address)).to.be.equal(1)
        })

        it("should not allow grieving attack with deposit of Share", async function () {
            await this.c.approve(this.alPine.address, 1000000000000)
            await this.alPine.deposit(this.c.address, this.alice.address, this.alice.address, 0, 1)
            await this.alPine.addProfit(this.c.address, 1)
            let amount = 2
            for (let i = 0; i < 20; i++) {
                await this.alPine.deposit(this.c.address, this.alice.address, this.alice.address, amount - 1, 0)
                amount += amount - 1
            }
            const ratio =
                (await this.alPine.totals(this.c.address)).elastic / (await this.alPine.balanceOf(this.c.address, this.alice.address))
            expect(ratio).to.be.lessThan(5)
        })
    })

    describe("Deposit To", function () {
        it("Mutates balanceOf and totalSupply correctly", async function () {
            await this.a.approve(this.alPine.address, getBigNumber(100))

            await expect(this.alPine.deposit(this.a.address, this.alice.address, this.bob.address, getBigNumber(100), 0))
                .to.emit(this.a, "Transfer")
                .withArgs(this.alice.address, this.alPine.address, "100000000000000000000")
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.a.address, this.alice.address, this.bob.address, "100000000000000000000", "76923076923076923076")

            expect(await this.alPine.balanceOf(this.a.address, this.alice.address), "incorrect amount calculation").to.be.equal(0)
            expect(await this.alPine.balanceOf(this.a.address, this.bob.address), "incorrect amount calculation").to.be.equal(
                "76923076923076923076"
            )

            expect((await this.alPine.totals(this.a.address)).elastic, "incorrect total amount").to.be.equal(getBigNumber(230))
        })
    })

    describe("Withdraw", function () {
        it("Reverts when address zero is passed as to argument", async function () {
            await expect(this.alPine.withdraw(this.a.address, this.alice.address, ADDRESS_ZERO, 1, 0)).to.be.revertedWith(
                "Alpine: to not set"
            )
        })

        it("Reverts when attempting to withdraw below 1000 shares", async function () {
            await this.AlpineMock.new("alp", this.weth9.address)
            await this.a.approve(this.alp.address, 1000)

            await expect(this.alp.deposit(this.a.address, this.alice.address, this.alice.address, 0, 1000))
                .to.emit(this.a, "Transfer")
                .withArgs(this.alice.address, this.alp.address, "1000")
                .to.emit(this.alp, "LogDeposit")
                .withArgs(this.a.address, this.alice.address, this.alice.address, "1000", "1000")

            await expect(this.alp.withdraw(this.a.address, this.alice.address, this.alice.address, 0, 2)).to.be.revertedWith(
                "Alpine: cannot empty"
            )
        })

        it("Reverts when attempting to withdraw larger amount than available", async function () {
            await this.a.approve(this.alPine.address, getBigNumber(1))

            await this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(1), 0)

            await expect(this.alPine.withdraw(this.a.address, this.alice.address, this.alice.address, getBigNumber(2), 0)).to.be.revertedWith(
                "BoringMath: Underflow"
            )
        })

        it("Reverts when attempting to withdraw an amount at computational limit (where deposit was valid)", async function () {
            await this.a.approve(this.alPine.address, computationalLimit.toString())
            await this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(1), 0)
            await expect(
                this.alPine.withdraw(this.a.address, this.alice.address, this.alice.address, computationalLimit.toString(), 0)
            ).to.be.revertedWith("BoringMath: Mul Overflow")
        })

        it("Reverts when attempting to withdraw an amount at alp protocol limit (where deposit was valid)", async function () {
            await this.a.approve(this.alPine.address, alpProtocolLimit.toString())
            await this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(1), 0)
            await expect(
                this.alPine.withdraw(this.a.address, this.alice.address, this.alice.address, alpProtocolLimit.toString(), 0)
            ).to.be.revertedWith("BoringMath: Underflow")
        })

        it("Mutates balanceOf of Token and Alpine correctly", async function () {
            const startBal = await this.a.balanceOf(this.alice.address)
            await this.a.approve(this.alPine.address, getBigNumber(130))
            await this.a.connect(this.bob).approve(this.alPine.address, getBigNumber(260))
            await expect(this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(130), 0))
                .to.emit(this.a, "Transfer")
                .withArgs(this.alice.address, this.alPine.address, "130000000000000000000")
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.a.address, this.alice.address, this.alice.address, "130000000000000000000", "100000000000000000000")
            await expect(this.alPine.connect(this.bob).deposit(this.a.address, this.bob.address, this.bob.address, getBigNumber(260), 0))
                .to.emit(this.a, "Transfer")
                .withArgs(this.bob.address, this.alPine.address, "260000000000000000000")
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.a.address, this.bob.address, this.bob.address, "260000000000000000000", "200000000000000000000")
            await expect(this.alPine.withdraw(this.a.address, this.alice.address, this.alice.address, 0, getBigNumber(100)))
                .to.emit(this.a, "Transfer")
                .withArgs(this.alPine.address, this.alice.address, "130000000000000000000")
                .to.emit(this.alPine, "LogWithdraw")
                .withArgs(this.a.address, this.alice.address, this.alice.address, "130000000000000000000", "100000000000000000000")

            expect(await this.a.balanceOf(this.alice.address), "alice should have all of their tokens back").to.equal(startBal)

            expect(await this.alPine.balanceOf(this.a.address, this.alice.address), "token should be withdrawn").to.equal(0)
        })

        it("Mutates balanceOf on Alpine for WETH correctly", async function () {
            await this.weth9.connect(this.alice).deposit({
                value: 1,
            })
            await this.alPine.connect(this.bob).deposit(ADDRESS_ZERO, this.bob.address, this.bob.address, getBigNumber(1), 0, {
                from: this.bob.address,
                value: getBigNumber(1),
            })

            await this.alPine
                .connect(this.bob)
                .withdraw(ADDRESS_ZERO, this.bob.address, this.bob.address, sansSafetyAmount(getBigNumber(1)), 0, {
                    from: this.bob.address,
                })

            expect(await this.alPine.balanceOf(this.weth9.address, this.bob.address), "token should be withdrawn").to.be.equal(100000)
        })

        it("Reverts if ETH transfer fails", async function () {
            await this.weth9.connect(this.alice).deposit({
                value: 1,
            })
            await this.alPine.connect(this.bob).deposit(ADDRESS_ZERO, this.bob.address, this.bob.address, getBigNumber(1), 0, {
                from: this.bob.address,
                value: getBigNumber(1),
            })

            await expect(
                this.alPine
                    .connect(this.bob)
                    .withdraw(ADDRESS_ZERO, this.bob.address, this.flashLoaner.address, sansSafetyAmount(getBigNumber(1)), 0, {
                        from: this.bob.address,
                    })
            ).to.be.revertedWith("Alpine: ETH transfer failed")
        })

        it("Emits LogWithdraw event with expected arguments", async function () {
            await this.a.approve(this.alPine.address, getBigNumber(1))

            this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(1), 0)

            await expect(this.alPine.withdraw(this.a.address, this.alice.address, this.alice.address, 1, 0))
                .to.emit(this.alPine, "LogWithdraw")
                .withArgs(this.a.address, this.alice.address, this.alice.address, 1, 1)
        })
    })

    describe("Withdraw From", function () {
        it("Mutates alPine balanceOf and token balanceOf for from and to correctly", async function () {
            const bobStartBalance = await this.a.balanceOf(this.bob.address)
            await this.a.approve(this.alPine.address, getBigNumber(1))

            await this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(1), 0)

            await this.alPine.withdraw(this.a.address, this.alice.address, this.bob.address, 1, 0)

            expect(await this.a.balanceOf(this.bob.address), "bob should have received their tokens").to.be.equal(bobStartBalance.add(1))
        })
    })

    describe("Transfer", function () {
        it("Reverts when address zero is given as to argument", async function () {
            await expect(this.alPine.transfer(this.a.address, this.alice.address, ADDRESS_ZERO, 1)).to.be.revertedWith("Alpine: to not set")
        })

        it("Reverts when attempting to transfer larger amount than available", async function () {
            await expect(this.alPine.connect(this.bob).transfer(this.a.address, this.bob.address, this.alice.address, 1)).to.be.revertedWith(
                "BoringMath: Underflow"
            )
        })

        it("Reverts when attempting to transfer amount below alp protocol limit but above balance", async function () {
            await expect(
                this.alPine.connect(this.bob).transfer(this.a.address, this.bob.address, this.alice.address, extremeValidVolume.toString())
            ).to.be.revertedWith("BoringMath: Underflow")
        })

        it("Reverts when attempting to transfer alp protocol limit", async function () {
            await expect(
                this.alPine.connect(this.bob).transfer(this.a.address, this.bob.address, this.alice.address, alpProtocolLimit.toString())
            ).to.be.revertedWith("BoringMath: Underflow")
        })

        it("Reverts when attempting to transfer computational limit", async function () {
            await expect(
                this.alPine.connect(this.bob).transfer(this.a.address, this.bob.address, this.alice.address, computationalLimit.toString())
            ).to.be.revertedWith("BoringMath: Underflow")
        })

        it("Mutates balanceOf for from and to correctly", async function () {
            await this.a.approve(this.alPine.address, getBigNumber(100))
            await this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(100), 0)
            await this.alPine.transfer(this.a.address, this.alice.address, this.bob.address, getBigNumber(50))

            expect(await this.alPine.balanceOf(this.a.address, this.alice.address), "token should be transferred").to.be.equal(
                "26923076923076923076"
            )
            expect(await this.alPine.balanceOf(this.a.address, this.bob.address), "token should be transferred").to.be.equal(
                "50000000000000000000"
            )
        })

        it("Emits LogTransfer event with expected arguments", async function () {
            await this.a.approve(this.alPine.address, 100)

            this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, 100, 0)

            await expect(this.alPine.transfer(this.a.address, this.alice.address, this.bob.address, 20))
                .to.emit(this.alPine, "LogTransfer")
                .withArgs(this.a.address, this.alice.address, this.bob.address, 20)
        })
    })

    describe("Transfer Multiple", function () {
        it("Reverts if first to argument is address zero", async function () {
            await expect(this.alPine.transferMultiple(this.a.address, this.alice.address, [ADDRESS_ZERO], [1])).to.be.reverted
        })

        it("should allow transfer multiple from alice to bob and carol", async function () {
            await this.a.approve(this.alPine.address, 200)
            await this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, 200, 0)

            await this.alPine.transferMultiple(this.a.address, this.alice.address, [this.bob.address, this.carol.address], [1, 1], {
                from: this.alice.address,
            })

            expect(await this.alPine.balanceOf(this.a.address, this.alice.address)).to.equal(151)
            expect(await this.alPine.balanceOf(this.a.address, this.bob.address)).to.equal(1)
            expect(await this.alPine.balanceOf(this.a.address, this.carol.address)).to.equal(1)
        })

        it("revert on multiple transfer at alp protocol limit from alice to both bob and carol", async function () {
            await this.a.approve(this.alPine.address, alpProtocolLimit.toString())
            await this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(1), 0)

            await expect(
                this.alPine.transferMultiple(
                    this.a.address,
                    this.alice.address,
                    [this.bob.address, this.carol.address],
                    [alpProtocolLimit.toString(), alpProtocolLimit.toString()],
                    { from: this.alice.address }
                )
            ).to.be.revertedWith("BoringMath: Underflow")
        })

        it("revert on multiple transfer at alp protocol limit from alice to bob only", async function () {
            await this.a.approve(this.alPine.address, alpProtocolLimit.toString())
            await this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(1), 0)

            await expect(
                this.alPine.transferMultiple(
                    this.a.address,
                    this.alice.address,
                    [this.bob.address, this.carol.address],
                    [alpProtocolLimit.toString(), getBigNumber(1)],
                    { from: this.alice.address }
                )
            ).to.be.revertedWith("BoringMath: Underflow")
        })

        it("revert on multiple transfer at computational limit from alice to both bob and carol", async function () {
            await this.a.approve(this.alPine.address, computationalLimit.toString())
            await this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(1), 0)

            await expect(
                this.alPine.transferMultiple(
                    this.a.address,
                    this.alice.address,
                    [this.bob.address, this.carol.address],
                    [computationalLimit.toString(), computationalLimit.toString()],
                    { from: this.alice.address }
                )
            ).to.be.revertedWith("BoringMath: Add Overflow")
        })

        it("revert on multiple transfer at computational limit from alice to bob only", async function () {
            await this.a.approve(this.alPine.address, computationalLimit.toString())
            await this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(1), 0)

            await expect(
                this.alPine.transferMultiple(
                    this.a.address,
                    this.alice.address,
                    [this.bob.address, this.carol.address],
                    [computationalLimit.toString(), getBigNumber(1)],
                    { from: this.alice.address }
                )
            ).to.be.revertedWith("BoringMath: Add Overflow")
        })
    })

    describe("Skim", function () {
        it("Skims tokens to from address", async function () {
            await this.a.transfer(this.alPine.address, 100)

            expect(await this.alPine.balanceOf(this.a.address, this.bob.address), "bob should have no tokens").to.be.equal(0)

            await expect(this.alPine.connect(this.bob).deposit(this.a.address, this.alPine.address, this.bob.address, 100, 0))
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.a.address, this.alPine.address, this.bob.address, "100", "76")

            expect(await this.alPine.balanceOf(this.a.address, this.bob.address), "bob should have tokens").to.be.equal(76)
        })

        it("should not allow skimming more than available", async function () {
            await this.a.transfer(this.alPine.address, 100)

            expect(await this.alPine.balanceOf(this.a.address, this.bob.address), "bob should have no tokens").to.be.equal(0)

            await expect(
                this.alPine.connect(this.bob).deposit(this.a.address, this.alPine.address, this.bob.address, 101, 0)
            ).to.be.revertedWith("Alpine: Skim too much")

            expect(await this.alPine.balanceOf(this.a.address, this.bob.address), "bob should have no tokens").to.be.equal(0)
        })

        it("should not allow skimming at alp protocol limit", async function () {
            await this.a.transfer(this.alPine.address, alpProtocolLimit.toString())

            expect(await this.alPine.balanceOf(this.a.address, this.bob.address), "bob should have no tokens").to.be.equal(0)

            await expect(
                this.alPine
                    .connect(this.bob)
                    .deposit(this.a.address, this.alPine.address, this.bob.address, bigInt(alpProtocolLimit).add(1).toString(), 0)
            ).to.be.revertedWith("Alpine: Skim too much")

            expect(await this.alPine.balanceOf(this.a.address, this.bob.address), "bob should have no tokens").to.be.equal(0)
        })

        it("Emits LogDeposit event with expected arguments", async function () {
            await this.a.transfer(this.alPine.address, 100)

            await expect(this.alPine.connect(this.bob).deposit(this.a.address, this.alPine.address, this.bob.address, 100, 0))
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.a.address, this.alPine.address, this.bob.address, "100", "76")
        })
    })

    describe("modifier allowed", function () {
        it("does not allow functions if MasterContract does not exist", async function () {
            await this.a.approve(this.alPine.address, 1)

            await expect(
                this.alPine.connect(this.bob).deposit(this.a.address, this.alice.address, this.alice.address, 1, 0)
            ).to.be.revertedWith("Alpine: no masterContract")
        })

        it("does not allow clone contract calls if MasterContract is not approved", async function () {
            const data = "0x00"

            let deployTx = await this.alPine.deploy(this.masterContractMock.address, data, true)
            const cloneAddress = (await deployTx.wait()).events[0].args.cloneAddress
            let pair = await this.masterContractMock.attach(cloneAddress)

            await this.a.approve(this.alPine.address, 1)

            await expect(pair.deposit(this.a.address, 1)).to.be.revertedWith("Alpine: Transfer not approved")
        })

        it("allow clone contract calls if MasterContract is approved", async function () {
            await this.alPine.whitelistMasterContract(this.masterContractMock.address, true)
            await setMasterContractApproval(this.alPine, this.alice, this.alice, "", this.masterContractMock.address, true, true)

            const data = "0x00"

            let deployTx = await this.alPine.deploy(this.masterContractMock.address, data, true)
            const cloneAddress = (await deployTx.wait()).events[0].args.cloneAddress
            let pair = await this.masterContractMock.attach(cloneAddress)

            await this.a.approve(this.alPine.address, 2)

            await pair.deposit(this.a.address, 1)

            expect(await this.alPine.balanceOf(this.a.address, pair.address)).to.be.equal(1)
        })
    })

    describe("Skim ETH", function () {
        it("Skims ether to from address", async function () {
            await this.weth9.connect(this.alice).deposit({
                value: 1000,
            })

            await this.alPine.batch([], true, {
                value: 1000,
            })

            await this.alPine.deposit(ADDRESS_ZERO, this.alPine.address, this.alice.address, 1000, 0)

            amount = await this.alPine.balanceOf(this.weth9.address, this.alice.address)

            expect(amount, "alice should have weth").to.equal(1000)

            expect(await this.weth9.balanceOf(this.alPine.address), "Alpine should hold WETH").to.equal(1000)
        })
    })

    describe("Batch", function () {
        it("Batches calls with revertOnFail true", async function () {
            await this.a.approve(this.alPine.address, 100)
            const deposit = this.alPine.interface.encodeFunctionData("deposit", [
                this.a.address,
                this.alice.address,
                this.alice.address,
                100,
                0,
            ])
            const transfer = this.alPine.interface.encodeFunctionData("transfer", [this.a.address, this.alice.address, this.bob.address, 76])
            await expect(this.alPine.batch([deposit, transfer], true))
                .to.emit(this.a, "Transfer")
                .withArgs(this.alice.address, this.alPine.address, "100")
                .to.emit(this.alPine, "LogDeposit")
                .withArgs(this.a.address, this.alice.address, this.alice.address, "100", "76")
                .to.emit(this.alPine, "LogTransfer")
                .withArgs(this.a.address, this.alice.address, this.bob.address, "76")
            assert.equal(await this.alPine.balanceOf(this.a.address, this.bob.address), 76, "bob should have tokens")
        })

        it("Batches calls with revertOnFail false", async function () {
            //tested in BoringSolidity
        })

        it("Does not revert on fail if revertOnFail is set to false", async function () {
            //tested in BoringSolidity
        })

        it("Reverts on fail if revertOnFail is set to true", async function () {
            //tested in BoringSolidity
        })
    })
    describe("FlashLoan", function () {
        it("should revert on batch flashloan if not enough funds are available", async function () {
            const param = this.alPine.interface.encodeFunctionData("toShare", [this.a.address, 1, false])
            await expect(
                this.alPine.batchFlashLoan(this.flashLoaner.address, [this.flashLoaner.address], [this.a.address], [getBigNumber(1)], param)
            ).to.be.revertedWith("BoringERC20: Transfer failed")
        })

        it("should revert on flashloan if fee can not be paid", async function () {
            await this.a.transfer(this.alPine.address, getBigNumber(2))
            await this.a.approve(this.alPine.address, getBigNumber(2))
            await this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(1), 0)
            const param = this.alPine.interface.encodeFunctionData("toShare", [this.a.address, 1, false])
            await expect(
                this.alPine.batchFlashLoan(this.flashLoaner.address, [this.flashLoaner.address], [this.a.address], [getBigNumber(1)], param)
            ).to.be.revertedWith("BoringERC20: Transfer")
        })

        it("should revert on flashloan if amount is not paid back", async function () {
            await this.a.approve(this.alPine.address, getBigNumber(2))
            await this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(1), 0)
            const param = this.alPine.interface.encodeFunctionData("toShare", [this.a.address, 1, false])
            await expect(
                this.alPine.flashLoan(this.sneakyFlashLoaner.address, this.sneakyFlashLoaner.address, this.a.address, getBigNumber(1), param)
            ).to.be.revertedWith("Alpine: Wrong amount")
        })

        it("should revert on batch flashloan if amount is not paid back", async function () {
            await this.a.approve(this.alPine.address, getBigNumber(2))
            await this.alPine.deposit(this.a.address, this.alice.address, this.alice.address, getBigNumber(1), 0)
            const param = this.alPine.interface.encodeFunctionData("toShare", [this.a.address, 1, false])
            await expect(
                this.alPine.batchFlashLoan(
                    this.sneakyFlashLoaner.address,
                    [this.sneakyFlashLoaner.address],
                    [this.a.address],
                    [getBigNumber(1)],
                    param
                )
            ).to.be.revertedWith("Alpine: Wrong amount")
        })

        it("should allow flashloan", async function () {
            await this.a.transfer(this.flashLoaner.address, getBigNumber(2))
            const maxLoan = (await this.a.balanceOf(this.alPine.address)).div(2)
            await this.alPine.flashLoan(this.flashLoaner.address, this.flashLoaner.address, this.a.address, maxLoan, "0x")
            expect(await this.alPine.toAmount(this.a.address, getBigNumber(100), false)).to.be.equal(
                getBigNumber(130).add(maxLoan.mul(5).div(10000))
            )
        })

        it("revert on request to flashloan at alp protocol limit", async function () {
            await this.a.transfer(this.flashLoaner.address, getBigNumber(2))
            const maxLoan = alpProtocolLimit.toString()
            await expect(
                this.alPine.flashLoan(this.flashLoaner.address, this.flashLoaner.address, this.a.address, maxLoan, "0x")
            ).to.be.revertedWith("BoringERC20: Transfer failed")
        })

        it("revert on request to flashloan at computational limit", async function () {
            await this.a.transfer(this.flashLoaner.address, getBigNumber(2))
            const maxLoan = computationalLimit.toString()
            await expect(
                this.alPine.flashLoan(this.flashLoaner.address, this.flashLoaner.address, this.a.address, maxLoan, "0x")
            ).to.be.revertedWith("BoringMath: Mul Overflow")
        })

        it("should allow flashloan with skimable amount on Alpine", async function () {
            await this.a.transfer(this.flashLoaner.address, getBigNumber(2))
            await this.a.transfer(this.alPine.address, getBigNumber(20))
            const maxLoan = getBigNumber(130).div(2)
            await this.alPine.flashLoan(this.flashLoaner.address, this.flashLoaner.address, this.a.address, maxLoan, "0x")
            expect(await this.alPine.toAmount(this.a.address, getBigNumber(100), false)).to.be.equal(
                getBigNumber(130).add(maxLoan.mul(5).div(10000))
            )
        })

        it("should allow batch flashloan", async function () {
            await this.a.transfer(this.flashLoaner.address, getBigNumber(2))
            const maxLoan = (await this.a.balanceOf(this.alPine.address)).div(2)
            await this.alPine.batchFlashLoan(this.flashLoaner.address, [this.flashLoaner.address], [this.a.address], [maxLoan], "0x")
            expect(await this.alPine.toAmount(this.a.address, getBigNumber(100), false)).to.be.equal(
                getBigNumber(130).add(maxLoan.mul(5).div(10000))
            )
        })

        it("revert on request to batch flashloan at alp protocol limit", async function () {
            await this.a.transfer(this.flashLoaner.address, getBigNumber(2))
            const maxLoan = alpProtocolLimit.toString()
            await expect(
                this.alPine.batchFlashLoan(this.flashLoaner.address, [this.flashLoaner.address], [this.a.address], [maxLoan], "0x")
            ).to.be.revertedWith("BoringERC20: Transfer failed")
        })

        it("revert on request to batch flashloan at computational limit", async function () {
            await this.a.transfer(this.flashLoaner.address, getBigNumber(2))
            const maxLoan = computationalLimit.toString()
            await expect(
                this.alPine.batchFlashLoan(this.flashLoaner.address, [this.flashLoaner.address], [this.a.address], [maxLoan], "0x")
            ).to.be.revertedWith("BoringMath: Mul Overflow")
        })
    })

    describe("set Strategy", function () {
        it("should allow to set strategy", async function () {
            await this.alPine.setStrategy(this.a.address, this.a.address)
        })

        it("should be reverted if 2 weeks are not up", async function () {
            await this.alPine.setStrategy(this.a.address, this.a.address)
            await expect(this.alPine.setStrategy(this.a.address, this.a.address)).to.be.revertedWith("StrategyManager: Too early")
        })

        it("should not allow bob to set Strategy", async function () {
            await expect(this.alPine.connect(this.bob).setStrategy(this.a.address, this.a.address)).to.be.reverted
        })

        it("should allow to exit strategy", async function () {
            await this.alPine.setStrategy(this.a.address, ADDRESS_ZERO)
            await advanceTime(1209600, ethers)
            await this.alPine.setStrategy(this.a.address, ADDRESS_ZERO)
        })
    })
})
