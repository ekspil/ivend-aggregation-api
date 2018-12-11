const mongoose = require('mongoose');

const controllerErrorModel = require('../schemes/controller.error.scheme');

module.exports = mongoose.model('ControllerErrorModel', controllerErrorModel, 'ControllerErrors')