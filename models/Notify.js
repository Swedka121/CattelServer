const mongoose = require("mongoose")
const User = require("./User")
const schema = new mongoose.Schema({
    user: { ref: User, type: mongoose.SchemaTypes.ObjectId, required: true },
    type: { type: String, enum: ["message", "request", "system", "news"], required: true },
    date: { type: Date, default: Date.now() },
    content: { type: String, required: true },
    readed: { type: Boolean, default: false },
})
module.exports = mongoose.model("Notify", schema)
