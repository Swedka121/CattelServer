const mongoose = require("mongoose")
const User = require("./User")
const schema = new mongoose.Schema({
    user: { ref: User, type: mongoose.SchemaTypes.ObjectId, required: true },
    familyId: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    ip: { type: String, required: true, unique: true },
    userAgent: { type: String, required: true, max: 512 },
    timestamp: { type: Date, default: Date.now() },
    isVerified: { type: Boolean, default: false },
    verifyCode: { type: String },
    socketid: { type: String, default: null },
    socketConnectCode: { type: String },
    connected: { type: Boolean, default: false },
    lastConnect: { type: Date, default: Date.now() },
})
// mongoose.deleteModel("Session")
module.exports = mongoose.model("Session", schema)
