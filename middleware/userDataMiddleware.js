module.exports = async (req, res, next) => {
    const ip = req.headers["x-forwarded-for"]
    const userAgent = req.headers["user-agent"]
    req.header_ip = ip
    req.userAgent = userAgent

    next()
}
