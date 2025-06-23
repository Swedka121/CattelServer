const ApiError = require("../error/ApiError")
const NotifyService = require("../services/NotifyService")

class NotifyController {
    static async getAllNotifies(req, res, next) {
        const user = req.user

        const res_ = await NotifyService.getAllNotifiesFromUserId(user._id)

        return res.json({ data: res_ }).status(200)
    }
    static async getPagesCount(req, res, next) {
        const user = req.user

        const res_ = await NotifyService.getPageCountFromUserId(user._id)

        return res.json({ data: res_ }).status(200)
    }

    static async getNotifiesFromPage(req, res, next) {
        const user = req.user
        let { page } = req.params

        page = Number(page) - 1

        const countOfPages = await NotifyService.getPageCountFromUserId(user._id)
        if (page > countOfPages) throw ApiError.badrequest("PAGE UNDEFINED!", "PAGE UNDEFINED! OUT OF LIMIT!")

        const res_ = await NotifyService.getNotifiesFromPageAndUserId(page, user._id)

        return res.json({ data: res_ }).status(200)
    }

    static async markNotifyAsReaded(req, res, next) {
        const { notifyId } = req.params

        const res_ = await NotifyService.markAsReadedNotify(notifyId)

        return res.json({ data: res_ }).status(200)
    }
}

module.exports = NotifyController
