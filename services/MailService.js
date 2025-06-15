const formData = require("form-data") // or built-in FormData
const Mailgun = require("mailgun.js")
const { getUserVerTemplate, getNewLoginTemplate, getSessionVerTemplate } = require("../utils/getTemplate")
const IpInfoService = require("./IpInfoService")

class MailService {
    constructor() {
        const mailgun = new Mailgun(formData)
        this.mg = mailgun.client({
            username: "api",
            key: process.env.MAILGUN_APIKEY,
        })
    }

    async sendVerifyUserMessage(email, code, username) {
        await this.mg.messages
            .create(process.env.MAILGUN_DOMAIN, {
                from: `Cattle <cattle@${process.env.MAILGUN_DOMAIN}>`,
                to: email,
                subject: "Account verify",
                text: `Your activation code is: ${code}`,
                html: getUserVerTemplate(code, username),
            })
            .then(() => {})
    }
    async sendVerifySessionMessage(email, code, username) {
        await this.mg.messages
            .create(process.env.MAILGUN_DOMAIN, {
                from: `Cattle <cattle@${process.env.MAILGUN_DOMAIN}>`,
                to: email,
                subject: "Account verify",
                text: `Your activation code is: ${code}`,
                html: getSessionVerTemplate(code, username),
            })
            .then(() => {})
    }
    async sendNewLoginNotify(email, ip, username) {
        const ipData = await IpInfoService.get(ip)

        await this.mg.messages
            .create(process.env.MAILGUN_DOMAIN, {
                from: `Cattle <cattle@${process.env.MAILGUN_DOMAIN}>`,
                to: email,
                subject: "New login",
                text: `New login by ip ${ip}`,
                html: getNewLoginTemplate(ipData, username),
            })
            .then(() => {})
    }
}

module.exports = new MailService()
