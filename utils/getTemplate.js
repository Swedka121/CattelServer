const fs = require("fs")
const path = require("path")

module.exports = {
    getUserVerTemplate: (code, username) => {
        return fs
            .readFileSync(path.resolve(__dirname, "../", "templates", "emailUserVer.html"))
            .toString()
            .replace("p.pcodep.p", code)
            .replace("p.pusernamep.p", username)
    },
    getSessionVerTemplate: (code, username) => {
        return fs
            .readFileSync(path.resolve(__dirname, "../", "templates", "emailUserVer.html"))
            .toString()
            .replace("p.pcodep.p", code)
            .replace("p.pusernamep.p", username)
    },
    getNewLoginTemplate: (ip, username) => {
        const allowedInfo = {
            region: ip?.region || "",
            regionCode: ip?.region_code || "",
            city: ip?.city || "Kyiv",
            type: ip?.type || "",
            domain: ip?.connection.domain || "",
            provider: ip?.connection.isp || "",
        }

        return fs
            .readFileSync(path.resolve(__dirname, "../", "templates", "emailNewLogin.html"))
            .toString()
            .replace("p.pusernamep.p", username)
            .replace("p.pplacep.p", allowedInfo.city)
            .replace(
                "p.pinfop.p",
                Object.entries(allowedInfo)
                    .map(([key, value]) => {
                        return key + ": " + value
                    })
                    .join(", ")
            )
            .replace("p.presetpassp.p", process.env.FRONT_END_ROOT || "qqq" + "/resetpass/" + username)
    },
}
