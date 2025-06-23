const express = require("express")
const router = express.Router()

const user = require("./user")
const notify = require("./notify")
router.use("/user", user)
router.use("/notify", notify)

module.exports = router
