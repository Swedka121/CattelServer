const mongoose = require("mongoose")
const User = require("./User")
const Message = require("./Message")
const schema = new mongoose.Schema({
    users: [{ type: mongoose.SchemaTypes.ObjectId, ref: User }],
    private: { type: Boolean, default: true },
    both: { type: Boolean, default: true },
    messages: [{ type: mongoose.SchemaTypes.ObjectId, ref: Message }],
    creationDate: { type: Date, default: Date.now() },
    name: { type: String, min: 3, max: 150 },
})

module.exports = mongoose.model("Chat", schema)
