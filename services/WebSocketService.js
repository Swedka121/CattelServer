const socket = require("socket.io")
const { createServer } = require("node:http")
const { app } = require("../index")

class WebSocketService {
    constructor() {
        this.server = createServer(app)
        this.io = new socket.Server(this.server, { cors: { origin: "*" } })

        this.io.on("connection", (socket) => {
            console.log("New client connected!! " + socket.id)
        })

        this.server.listen(process.env.WEBSOCKET_PORT)
    }
}

module.exports = { websocket: new WebSocketService() }
