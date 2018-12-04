const mongoose = require('mongoose');

const controllerScheme = require('../schemes/controller.scheme');

module.exports = mongoose.model('Controller', controllerScheme, 'Controllers')