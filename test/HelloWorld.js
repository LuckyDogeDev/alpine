const assert = require("assert")
const { getBigNumber, setMasterContractApproval, createFixture } = require("./utilities")

let cmd, fixture

describe("HelloWorld", function () {
    const APPROVAL_AMOUNT = 1000

    before(async function () {
        fixture = await createFixture(deployments, this, async (cmd) => {
            await cmd.deploy("weth9", "WETH9Mock")
            await cmd.deploy("alPine", "AlpineMock", this.weth9.address)
            await cmd.addToken("tokenA", "Token A", "A", 18, this.ReturnFalseERC20Mock)
            await cmd.deploy("helloWorld", "HelloWorld", this.alPine.address, this.tokenA.address)
        })
        cmd = await fixture()
    })

    it("should reject deposit: no token- nor master contract approval", async function () {
        await assert.rejects(this.helloWorld.deposit(APPROVAL_AMOUNT))
    })

    it("approve Alpine", async function () {
        await this.tokenA.approve(this.alPine.address, getBigNumber(APPROVAL_AMOUNT, await this.tokenA.decimals()))
    })

    it("should reject deposit: user approved, master contract not approved", async function () {
        await assert.rejects(this.helloWorld.deposit(APPROVAL_AMOUNT))
    })

    it("approve master contract", async function () {
        await setMasterContractApproval(this.alPine, this.alice, this.alice, this.alicePrivateKey, this.helloWorld.address, true)
    })

    it("should allow deposit", async function () {
        await this.helloWorld.deposit(APPROVAL_AMOUNT)
        assert.equal((await this.helloWorld.balance()).toString(), APPROVAL_AMOUNT.toString())
    })

    it("should allow withdraw", async function () {
        await this.helloWorld.withdraw()
    })
})
