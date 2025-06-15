class IpInfoService {
    static async get(ip) {
        try {
            const data = await fetch("https://ipwho.is/" + ip)
                .then((res) => res.json())
                .then((res) => res)
            if (!data.success) return
            return data
        } catch (err) {
            console.log("error")
        }
    }
}

module.exports = IpInfoService
