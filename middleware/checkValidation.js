const { validationResult } = require("express-validator")
const ApiError = require("../error/ApiError")

module.exports = async function middleware(req, res, next) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        throw ApiError.badrequest("Params is not valid! \n" + errors.array().join("\n"), "Params is not valid!")
    }

    next()
}
