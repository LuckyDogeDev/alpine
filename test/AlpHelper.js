const { expect } = require("chai")
const { createFixture } = require("./utilities")

let cmd, fixture

describe("AlpHelper", function () {
    before(async function () {
        fixture = await createFixture(deployments, this, async (cmd) => {
            await cmd.deploy("helper", "AlpHelper")
        })
    })

    beforeEach(async function () {
        cmd = await fixture()
    })
})
