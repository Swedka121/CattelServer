const { json } = require("body-parser")
const UserService = require("../services/UserService")
const SessionService = require("../services/SessionService")
const User = require("../models/User")

class UserController {
    static async register(req, res, next) {
        const { username, password, email } = req.body

        const res_ = await UserService.registerUser(username, password, email)

        res.status(200).json({ data: res_ })
    }
    static async login(req, res, next) {
        const { username, password } = req.body
        const ip = req.header_ip
        const userAgent = req.userAgent

        const res_ = await UserService.login(username, password, ip, userAgent)

        res.status(200).json({ data: res_ })
    }
    static async verify(req, res, next) {
        const { userId, code } = req.body
        const ip = req.header_ip
        const userAgent = req.userAgent

        const res_ = await UserService.verify(userId, code, ip, userAgent)

        res.status(200).json({ data: res_ })
    }
    static async check(req, res, next) {
        const accessToken = req.headers["authorization"]
        const sessionId = req.headers["x-session-id"]
        const ip = req.header_ip

        const res_ = await SessionService.checkSession(sessionId, ip, accessToken)

        res.json({ data: res_ }).status(200)
    }
    static async refresh(req, res, next) {
        const { accessToken, sessionId, refreshToken } = req.body
        const ip = req.header_ip

        console.log(accessToken, refreshToken, sessionId)

        const res_ = await SessionService.refreshSession(sessionId, ip, accessToken, refreshToken)

        res.json({ data: res_ }).status(200)
    }
    static async verifySession(req, res, next) {
        const { userId, code } = req.body
        const ip = req.header_ip

        const res_ = await SessionService.verifySession(ip, userId, code)

        res.json({ data: res_ }).status(200)
    }
    static async connectWebSocket(req, res, next) {
        const session = req.session

        const token = await SessionService.createSocketConnect(session.id)

        res.json({ data: token }).status(200)
    }
    static async getAllSessions(req, res, next) {
        const session = req.session

        const sessions = await SessionService.getAllUserSessionsBySession(session.id)

        res.json({ data: sessions }).status(200)
    }
    static async logout(req, res, next) {
        const user = req.user
        const session = req.session

        await SessionService.closeSession(session.id, user.id)

        res.json({ data: "Ok!" }).status(200)
    }
    static async closeSession(req, res, next) {
        const user = req.user
        const { sessionId } = req.body

        await SessionService.closeSession(sessionId, user.id)

        res.json({ data: "Ok!" }).status(200)
    }
}

module.exports = UserController
