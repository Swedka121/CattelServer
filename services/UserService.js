const User = require("../models/User")
const crypto = require("crypto")
const MailService = require("./MailService")
const SessionService = require("./SessionService")

class UserService {
    static async registerUser(username, password, email) {
        if (!username || !password || !email) throw new Error("REQUIRED PARAMS UNDEFINED!")

        const hash = crypto.hash("sha1", password)

        const user = new User({ username, email, password: hash })

        const verifyCode = Math.floor(Math.random() * 999999)
        user.verifyCode = verifyCode

        await MailService.sendVerifyUserMessage(email, verifyCode, username)

        await user.save()
        return { userId: user.id }
    }

    static async verify(id, code, ip, userAgent) {
        if (!id || !code || !ip || !userAgent) throw new Error("REQUIRED PARAMS UNDEFINED!")

        const user = await User.findById(id)
        if (!user) throw new Error("USER FOR VERIFY UNDEFINED!")

        if (user.verifyCode != code) throw new Error("VERIFY CODE IS WRONG!")

        user.isVerified = true
        user.verifyCode = null
        await user.save()

        const session = await SessionService.createSessionWitoutVerify(ip, userAgent, user.id)

        await MailService.sendNewLoginNotify(user.email, ip, user.username)

        return { accessToken: session.accessToken, refreshToken: session.refreshToken, sessionId: session.id }
    }

    static async login(username, password, ip, userAgent) {
        if (!username || !password || !ip || !userAgent) throw new Error("REQUIRED PARAMS UNDEFINED!")

        const user = await User.findOne({ username })
        if (!user) throw new Error("USER FOR LOGIN UNDEFINED!")
        if (!user.isVerified) throw new Error("USER IS NOT VERIFIED!")

        const hash = crypto.hash("sha1", password)
        if (user.password != hash) throw new Error("LOGIN OR PASSWORD IS WRONG!")

        const session = await SessionService.registerNew(ip, userAgent, user.id)

        return { userId: user.id }
    }
}

module.exports = UserService
