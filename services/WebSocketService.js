const socket = require("socket.io")
const { createServer } = require("node:http")
const { app } = require("../index")
const SessionService = require("./SessionService")

class WebSocketService {
    constructor() {
        this.server = createServer(app)
        this.io = new socket.Server(this.server, { cors: { origin: "*" } })

        this.io.on("connection", async (socket) => {
            if (!socket.handshake.auth.token) {
                return socket.disconnect(true)
            }
            const token = socket.handshake.auth.token

            try {
                await SessionService.checkSocketConnect(token, socket.id)
            } catch (err) {
                return socket.disconnect(true)
            }

            socket.on("disconnecting", () => {
                console.log("Diconnection! ", socket.id)
            })

            console.log("New client connected!! " + socket.id)
        })

        this.server.listen(process.env.WEBSOCKET_PORT)
    }
}

module.exports = { websocket: new WebSocketService() }
