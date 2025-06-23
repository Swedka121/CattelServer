const ApiError = require("../error/ApiError")
const Chat = require("../models/Chat")
const Notify = require("../models/Notify")
const User = require("../models/User")
const WebSocketService = require("./WebSocketService")

class NotifyService {
    static async newNotify(userId, type, content) {
        if (!userId || !type || !content) throw ApiError.rpu()
        const user = await User.findById(userId)
        if (!user) throw ApiError.badrequest("USER FOR NOTIFY UNDEFINED!", "USER FOR NOTIFY UNDEFINED!")
        const notify = new Notify({ user, type, content })
        await notify.save()

        await WebSocketService.websocket.notifyUser(user._id, notify)

        return notify
    }
    static async messageNotify(user, chatId) {
        if (!user || !chatId) throw ApiError.rpu()
        const chat = await Chat.findById(chatId)
        if (!chat) throw ApiError.badrequest("CHAT FOR NOTIFY UNDEFINED!", "CHAT FOR NOTIFY UNDEFINED!")
        return await NotifyService.newNotify(user, "message", `You have new message from ${chat.name}`)
    }
    static async requestNotify(user, fromUser) {
        if (!user || !fromUser) throw ApiError.rpu()
        const fromUser_ = await User.findById(fromUser)
        if (!fromUser_) throw ApiError.badrequest("UNDEFINED REQUESTER!")
        return await NotifyService.newNotify(user, "request", `You have new request from ${fromUser_.username}`)
    }
    static async newsNotify(user, news) {
        if (!user || !news) throw ApiError.rpu()
        return await NotifyService.newNotify(user, "news", `Hey, here are new news for you!\n${news}`)
    }
    static async systemNotify(user, content) {
        if (!user || !content) throw ApiError.rpu()
        return await NotifyService.newNotify(user, "system", content)
    }
    static async markAsReadedNotify(notifyId) {
        if (!notifyId) throw ApiError.rpu()
        const notify = await Notify.findById(notifyId)
        if (!notify) throw ApiError.badrequest("NOTIFY TO MARK UNDEFINED!", "NOTIFY TO MARK UNDEFINED!")
        notify.readed = true
        await notify.save()
        return notify
    }
    static async getAllNotifiesFromUserId(userId) {
        if (!userId) throw ApiError.rpu()
        const notifies = await Notify.find({ user: userId }).sort({ readed: 1, date: -1 })

        return notifies
    }
    static async getNotifiesFromPageAndUserId(page, userId) {
        if (!userId) throw ApiError.rpu()
        const notifies = await Notify.find({ user: userId })
            .sort({ readed: 1, date: -1 })
            .skip(process.env.PAGE_SIZE * page)
            .limit(process.env.PAGE_SIZE)

        return notifies
    }
    static async getPageCountFromUserId(userId) {
        if (!userId) throw ApiError.rpu()
        const count = await Notify.countDocuments()

        return Math.ceil(count / process.env.PAGE_SIZE)
    }
}
module.exports = NotifyService
