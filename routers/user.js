const express = require("express")
const UserController = require("../controllers/UserController")
const UserService = require("../services/UserService")
const router = express.Router()

const authMiddleware = require("../middleware/auth")

router.post("/register", UserController.register)
router.post("/login", UserController.login)
router.post("/verify", UserController.verify)
router.post("/verify/session", UserController.verifySession)
router.post("/refresh", UserController.refresh)
router.get("/websoket/getconnect", authMiddleware(), UserController.connectWebSocket)
router.get("/sessions", authMiddleware(), UserController.getAllSessions)
router.post("/sessions/close", authMiddleware(), UserController.closeSession)
router.post("/logout", authMiddleware(), UserController.logout)
router.get("/check", UserController.check)

module.exports = router
