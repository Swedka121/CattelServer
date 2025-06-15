const mongoose = require("mongoose")
const schema = new mongoose.Schema({
    username: { type: String, min: 3, max: 50, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false },
    verifyCode: { type: Number, default: null },
})

// mongoose.deleteModel("User")

module.exports = mongoose.model("User", schema)
