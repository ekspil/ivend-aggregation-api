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

    static validateRegisterErrorRequest(registerErrorRequest) {

        const schema = Joi.object().keys({
            UID: Joi.string().required(),
            Key: Joi.string().required(),
            ErrorTime: Joi.number().required(),
            Msg: Joi.string().required(),
        })

        const validationResult = Joi.validate(registerErrorRequest, schema)

        try {
            const date = new Date(registerErrorRequest.ErrorTime)

            if (!date instanceof Date || date.getFullYear() < 2000) {
                throw new Error()
            }

        } catch (e) {
            validationResult.error = true
        }

        return validationResult
    }

}

module.exports = ValidationService
