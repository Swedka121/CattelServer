module.exports = function generateFamilyId() {
    const allowedStr = "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM".split("")

    let str = ""
    for (let i = 0; i < 32; i++) {
        str += allowedStr[Math.floor(Math.random() * allowedStr.length)]
    }

    return new Date().getTime() + "-" + str
}
