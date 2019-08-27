const Joi = require("joi")

class ValidationService {

    constructor() {
    }

    static validateRegisterControllerRequest(registerControllerRequest) {
        const schema = Joi.object().keys({
            UID: Joi.string().required(),
            FW: Joi.string().required(),
        })

        return Joi.validate(registerControllerRequest, schema)

    }

    static validateRegisterErrorRequest(registerErrorRequest) {

        const schema = Joi.object().keys({
            UID: Joi.string().required(),
            Key: Joi.string().required(),
            ErrorTime: Joi.string().required().regex(/^[0-9]{10,10}$/),
            Msg: Joi.string().required(),
        })

        const validationResult = Joi.validate(registerErrorRequest, schema)

        try {
            const date = new Date(registerErrorRequest.ErrorTime)

            if (!(date instanceof Date) || date.getFullYear() < 2000) {
                throw new Error()
            }

        } catch (e) {
            validationResult.error = true
        }

        return validationResult
    }
    static validateRegisterStateRequest(registerStateRequest) {

        const schema = Joi.object().keys({
            UID: Joi.string().required(),
            Key: Joi.string().required(),
            State: Joi.object().keys({
                ch: Joi.number().integer().min(0).max(2).required(),
                bh: Joi.number().integer().min(0).max(2).required(),
                cv: Joi.number().integer().min(0).required(),
                bv: Joi.number().integer().min(0).required(),
                bus: Joi.string().required().length(4),
                ms: Joi.number().integer().min(0).max(2).required(),
            }),
        })

        return Joi.validate(registerStateRequest, schema)
    }

    static validateRegisterSaleRequest(registerSaleRequest) {
        const schema = Joi.object().keys({
            UID: Joi.string().required(),
            Key: Joi.string().required(),
            Price: Joi.number().required(),
            Pt: Joi.number().integer().min(0).max(1).required(),
            CheckTime: Joi.string().required().regex(/^[0-9]{10,10}$/),
            ButtonId: Joi.number().integer().required()
        })

        return Joi.validate(registerSaleRequest, schema)
    }

    static validateRegisterEventRequest(registerEventRequest) {
        const schema = Joi.object().keys({
            UID: Joi.string().required(),
            Key: Joi.string().required(),
            EventTime: Joi.number().required(),
            Code: Joi.number().integer().min(1).max(2).required(),
        })

        return Joi.validate(registerEventRequest, schema)
    }

}

module.exports = ValidationService
