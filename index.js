require("dotenv").config()

const express = require("express")
const app = express()
module.exports = { app }
const router = require("./routers/main")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const ApiError = require("./error/ApiError")
const websocket = require("./services/WebSocketService")

const mongoose = require("mongoose")
const userDataMiddleware = require("./middleware/userDataMiddleware")
const checkValidation = require("./middleware/checkValidation")

const User = require("./models/User")
const Session = require("./models/Session")
const Chat = require("./models/Chat")
const Message = require("./models/Message")
const Notify = require("./models/Notify")
const NotifyService = require("./services/NotifyService")

app.use(checkValidation)
app.use(userDataMiddleware)
app.use(express.json())
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(
    cors({
        credentials: true,
        origin: ["http://localhost:9000"],
        allowedHeaders: ["X-Session-Id"],
    })
)
app.use("/api/v0", router)

app.use((err, req, res, next) => {
    console.log(err)
    if (err instanceof ApiError) return res.status(err.code).json({ message: err.message_client })
    if (err.code && err.code == 11000) return res.status(400).json({ message: "Duplicate data!" })
    res.status(500).json({ message: "Oops! Something went wrong." })
})

async function connectDB() {
    try {
        await mongoose.connect(
            process.env.DB_URL.replace("<db_username>", process.env.DB_USERNAME).replace(
                "<db_password>",
                process.env.DB_PASS
            ),
            { dbName: process.env.DB_NAME }
        )
        console.log("Connected to DB!")
    } catch (err) {
        throw new Error("Connect to db failed!")
    }
}

connectDB()

app.listen(3000, async () => {
    console.log("app server listening on port 3000")
    // await NotifyService.systemNotify("684860f9b8682007d2a39fba", "Hello")
    // await MailService.sendVerifyUserMessage("ivan.hryshchuk2011@gmail.com", 655553, "swedka121")
})
