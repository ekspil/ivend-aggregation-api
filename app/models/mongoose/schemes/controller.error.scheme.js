const mongoose = require("mongoose")

module.exports = new mongoose.Schema({
    createdTime: {
        type: Date,
        default: Date.now,
        required: true
    },
    errorTime: {
        type: String,
        default: Date.now,
        required: false
    },
    message: {
        type: String,
        required: true
    }
})
