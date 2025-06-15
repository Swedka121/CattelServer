const { header } = require("express-validator")
const Session = require("../models/Session")
const User = require("../models/User")
const SessionService = require("../services/SessionService")

module.exports = function middleware() {
    const arrayOfFuncs = [
        header("authorization").notEmpty(),
        header("x-session-id").notEmpty().isMongoId(),
        async (req, res, next) => {
            const accessToken = req.headers["authorization"]
            const sessionId = req.headers["x-session-id"]
            const ip = req.header_ip

            const res_ = await SessionService.checkSession(sessionId, ip, accessToken)
            if (!res_) {
                throw new Error("TOKEN NOT ALLOWED!")
            }

            const session = await Session.findById(sessionId)
            const user = await User.findById(session.user)

            req.session = session
            req.user = user

            next()
        },
    ]

    return arrayOfFuncs
}
