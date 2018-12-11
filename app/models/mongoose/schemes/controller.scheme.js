const mongoose = require("mongoose")
const controllerErrorSchema = require("./controller.error.scheme")

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
    controllerErrors: {
        type: [controllerErrorSchema],
        required: false
    }
});
