const mongoose = require("mongoose")
const User = require("./User")
const Chat = require("./Chat")
const schema = new mongoose.Schema({
    chat: { type: mongoose.SchemaTypes.ObjectId, ref: Chat, required: true },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: User, required: true },
    content: { type: String, min: 1, max: 1000, required: true },
    edited: { type: Boolean, default: false },
    creationDate: { type: Date, default: Date.now() },
})

module.exports = mongoose.model("Message", schema)
