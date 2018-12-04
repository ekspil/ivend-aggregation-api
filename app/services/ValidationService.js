const Joi = require("joi")

class ValidationService {

    constructor() {
    }

    static validateRegisterControllerRequest(registerControllerRequest) {

        const schema = Joi.object().keys({
            UID: Joi.string().required(),
        })

        return Joi.validate(registerControllerRequest, schema)

    }
}

module.exports = ValidationService
