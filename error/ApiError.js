class ApiError extends Error {
    constructor(message_log, message_client, code) {
        super(message_log)

        this.code = code
        this.message_client = message_client

        console.log(this)
    }

    static badrequest(message_log, message_client) {
        return new ApiError(message_log, message_client, 400)
    }
    static unauthorized(message_log) {
        return new ApiError(message_log, "UNAUTHORIZED!", 401)
    }
    static forbidden(message_log) {
        return new ApiError(message_log, "FORBIDDEN!", 401)
    }
}

module.exports = ApiError
