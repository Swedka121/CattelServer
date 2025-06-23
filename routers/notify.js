const express = require("express")
const UserController = require("../controllers/UserController")
const UserService = require("../services/UserService")
const router = express.Router()

const authMiddleware = require("../middleware/auth")
const NotifyController = require("../controllers/NotifyController")

router.get("/all", authMiddleware(), NotifyController.getAllNotifies)
router.get("/page/:page", authMiddleware(), NotifyController.getNotifiesFromPage)
router.get("/page", authMiddleware(), NotifyController.getPagesCount)
router.put("/:notifyId", authMiddleware(), NotifyController.markNotifyAsReaded)

module.exports = router
