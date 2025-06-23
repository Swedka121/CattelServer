const Session = require("../models/Session")
const genFamilyId = require("../utils/genFamilyId")
const jwt = require("jsonwebtoken")
const MailService = require("./MailService")
const User = require("../models/User")
const ApiError = require("../error/ApiError")
const NotifyService = require("./NotifyService")

class SessionService {
    static async registerNew(ip, userAgent, userId) {
        if (!ip || !userId || !userAgent) throw ApiError.rpu()
        const user = await User.findById(userId)
        if (!user) throw ApiError.badrequest("USER FOR SESSION CREATE UNDEFINED!", "USER FOR SESSION CREATE UNDEFINED!")

        const deleted = await Session.deleteOne({ ip: ip })

        const familyId = genFamilyId()
        const accessToken = await jwt.sign(
            {
                familyId,
                ip,
                userId,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        )
        const refreshToken = await jwt.sign(
            {
                familyId,
                ip,
                userId,
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "3d" }
        )

        const verifyCode = Math.floor(Math.random() * 999999)

        const session = new Session({
            ip,
            userAgent,
            familyId,
            accessToken,
            refreshToken,
            user: userId,
            verifyCode,
            isVerified: false,
        })

        await MailService.sendVerifySessionMessage(user.email, verifyCode, user.username)

        await session.save()
        return user.id
    }

    static async createSessionWitoutVerify(ip, userAgent, userId) {
        if (!ip || !userId) throw ApiError.rpu()
        const user = await User.findById(userId)
        if (!user) throw ApiError.badrequest("USER FOR SESSION CREATE UNDEFINED!", "USER FOR SESSION CREATE UNDEFINED!")

        const deleted = await Session.deleteOne({ ip: ip })

        const familyId = genFamilyId()
        const accessToken = await jwt.sign(
            {
                familyId,
                ip,
                userId,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        )
        const refreshToken = await jwt.sign(
            {
                familyId,
                ip,
                userId,
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "3d" }
        )

        const session = new Session({
            ip,
            userAgent,
            familyId,
            accessToken,
            refreshToken,
            user: userId,
            verifyCode: null,
            isVerified: true,
        })

        await session.save()
        await NotifyService.systemNotify(
            userId,
            "Hey there, curious cat! 🐱 Welcome to Cattel — your cozy corner to chat, chill, and connect."
        )
        return { accessToken: session.accessToken, refreshToken: session.refreshToken, sessionId: session.id }
    }

    static async verifySession(ip, userId, code) {
        if (!ip || !userId || !code) throw ApiError.rpu()
        const session = await Session.findOne({ user: userId, ip })
        const user = await User.findById(userId)
        if (!session || !user) throw ApiError.badrequest("SESSION TO VERIFY UNDEFINED!", "SESSION TO VERIFY UNDEFINED!")

        if (session.verifyCode != code) throw ApiError.badrequest("VERIFY CODE IS WRONG!", "VERIFY CODE IS WRONG!")
        session.verifyCode = null
        session.isVerified = true

        await session.save()
        await NotifyService.systemNotify(
            userId,
            "Pawprint confirmed! 🐾\nYou’re now logged in to Cattel — your cozy digital chat spot.\nTime to stretch, scroll, and say hi.\nYou can see login info in sessions menu!"
        )
        return { accessToken: session.accessToken, refreshToken: session.refreshToken, sessionId: session.id }
    }

    static async checkSession(sessionId, ip, accessToken) {
        if (!sessionId || !accessToken) throw ApiError.unauthorized("ACTIVE SESSION UNDEFINED!")
        const session = await Session.findOne({ _id: sessionId, ip })
        if (!session || !session.isVerified) throw ApiError.unauthorized("ACTIVE SESSION UNDEFINED!")

        let decoded
        try {
            decoded = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, {})
        } catch (err) {
            throw ApiError.unauthorized("TOKEN NOT ALLOWED!")
        }

        if (session.familyId != decoded.familyId || decoded.ip != session.ip || session.ip != ip)
            throw ApiError.unauthorized("TOKEN NOT ALLOWED!")

        return true
    }

    static async refreshSession(sessionId, ip, accessToken, refreshToken) {
        console.log(sessionId, ip, accessToken, refreshToken)
        if (!sessionId || !ip || !accessToken || !refreshToken) throw ApiError.unauthorized("ACTIVE SESSION UNDEFINED!")
        const session = await Session.findById(sessionId)
        if (!session || !session.isVerified) throw ApiError.unauthorized("ACTIVE SESSION UNDEFINED!")

        let decoded, decoded2, refreshed
        try {
            decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
            refreshed = false
        } catch (err) {
            try {
                decoded2 = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
                refreshed = true
            } catch (err) {
                throw ApiError.unauthorized("TOKEN NOT ALLOWED!")
            }
        }

        if (!refreshed) return { accessToken, refreshToken, sessionId }

        if (session.familyId != decoded2.familyId || decoded2.ip != session.ip || ip != session.ip)
            throw ApiError.unauthorized("TOKEN NOT ALLOWED!")

        let familyId = genFamilyId()
        accessToken = await jwt.sign(
            {
                familyId,
                ip: session.ip,
                userId: session.user,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        )
        refreshToken = await jwt.sign(
            {
                familyId,
                ip: session.ip,
                userId: session.user,
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "3d" }
        )

        session.accessToken = accessToken
        session.refreshToken = refreshToken
        session.familyId = familyId

        await session.save()

        return { accessToken, refreshToken, sessionId: session.id }
    }
    static async createSocketConnect(sessionId) {
        if (!sessionId) throw ApiError.rpu()
        const session = await Session.findById(sessionId)
        if (!session || !session.isVerified) throw ApiError.unauthorized("ACTIVE SESSION UNDEFINED!")

        const token = genFamilyId()
        session.socketConnectCode = token
        await session.save()

        const jwt_ = jwt.sign({ code: token, sessionId }, process.env.WEBSOCKET_TOKEN_SECRET, { expiresIn: "2m" })

        return jwt_
    }
    static async checkSocketConnect(token, socketid) {
        if (!token) throw ApiError.rpu()
        const decode = jwt.verify(token, process.env.WEBSOCKET_TOKEN_SECRET)

        const session = await Session.findById(decode.sessionId)
        if (!session || !session.isVerified) throw ApiError.unauthorized("ACTIVE SESSION UNDEFINED!")
        if (session.socketConnectCode != decode.code) throw ApiError.unauthorized("TOKEN NOT ALLOWED!")

        session.lastConnect = new Date()
        session.connected = true
        session.socketid = socketid
        session.socketConnectCode = null

        await session.save()
        return true
    }
    static async disconnectSocket(socketid) {
        if (!socketid) throw ApiError.rpu()
        const session = await Session.findOne({ socketid })
        if (!session) throw ApiError.unauthorized("ACTIVE SESSION UNDEFINED!")

        session.connected = false
        session.socketid = null

        await session.save()

        return true
    }
    static async getAllUserSessionsBySession(sessionId) {
        if (!sessionId) throw ApiError.rpu()
        const session = await Session.findById(sessionId)
        if (!session || !session.isVerified) throw ApiError.unauthorized("ACTIVE SESSION UNDEFINED!")
        const user = await User.findById(session?.user)
        if (!user) {
            session.deleteOne()
            throw ApiError.unauthorized("ACTIVE SESSION UNDEFINED!")
        }

        const allSessions = await Session.find({ user: user.id })

        return this.getAllAllowedInfo(allSessions)
    }
    static async getAllUserSessionsByUserId(userId) {
        if (!userId) throw ApiError.rpu()
        const allSessions = await Session.find({ user: userId })

        return this.getAllAllowedInfo(allSessions)
    }
    static async closeSession(sessionId, userId) {
        if (!sessionId) throw ApiError.rpu()
        const session = await Session.findById(sessionId)

        if (session.user != userId)
            throw ApiError.badrequest("THIS SESSION NOT ALLOWED TO CLOSE!", "THIS SESSION NOT ALLOWED TO CLOSE!")

        await session.deleteOne()

        return true
    }
    static getAllAllowedInfo(sessionModels) {
        return sessionModels.map((el) => {
            return {
                id: el._id,
                ip: el.ip,
                socketId: el.socketid,
                verified: el.isVerified,
                connected: el.connected,
                lastConnect: el.lastConnect,
                userAgent: el.userAgent,
            }
        })
    }
}

module.exports = SessionService
