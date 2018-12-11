const mongoose = require("mongoose")

module.exports = new mongoose.Schema({
    uid: {
        type: String,
        required: true
    },
    accessKey: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        required: true,
        enum: ['mdb', 'exe', 'cashless']
    },
})
