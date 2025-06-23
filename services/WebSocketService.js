const socket = require("socket.io")
const { createServer } = require("node:http")
const { app } = require("../index")
const ApiError = require("../error/ApiError")

class WebSocketService {
    constructor() {
        this.server = createServer(app)
        this.io = new socket.Server(this.server, {
            cors: { origin: ["http://localhost:5173", "http://192.168.31.30:5173/"] },
        })
        this.query = []

        this.io.on("connection", async (socket) => {
            if (!socket.handshake.auth.token) {
                return socket.disconnect(true)
            }
            const token = socket.handshake.auth.token

            try {
                const SessionService = require("./SessionService")
                await SessionService.checkSocketConnect(token, socket.id)
            } catch (err) {
                return socket.disconnect(true)
            }

            socket.on("disconnecting", async () => {
                const SessionService = require("./SessionService")
                await SessionService.disconnectSocket(socket.id)
                console.log("Diconnection! ", socket.id)
            })

            console.log("New client connected!! " + socket.id)
        })

        this.server.listen(process.env.WEBSOCKET_PORT, () => {
            console.log("Websocket server start on port " + process.env.WEBSOCKET_PORT)
        })
    }

    async getAllConnectedSocketsFromUserId(userId) {
        const SessionService = require("./SessionService")
        const sessions = await SessionService.getAllUserSessionsByUserId(userId)

        return sessions.map((el) => (el.connected ? el.socketId : null))
    }

    emitEvent(socket, event, args) {
        this.io.to(socket).emit(event, args)
    }

    async notifyUser(userId, notify) {
        if (!userId || !notify) throw ApiError.rpu()
        const sockets = await this.getAllConnectedSocketsFromUserId(userId)

        sockets.forEach((el) => {
            this.emitEvent(el, "newNotify", notify)
        })
    }
}

module.exports = { websocket: new WebSocketService(), class: WebSocketService }
