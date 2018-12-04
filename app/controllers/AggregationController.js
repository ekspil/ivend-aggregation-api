const ControllerService = require("../services/ControllerService")
const ValidationService = require("../services/ValidationService")
const RegisterControllerRequest = require("../models/RegisterControllerRequest")
const RegisterControllerResponse = require("../models/RegisterControllerResponse")


class AggregationController {

    /**
     * AggregationController
     */
    constructor() {
        this.controllerService = new ControllerService();

        this.registerController = this.registerController.bind(this)
        this.returnValidationError = this.returnValidationError.bind(this)
    }

    async registerController(ctx) {
        try {
            const {UID} = ctx.request.body

            const validationResult = ValidationService.validateRegisterControllerRequest({UID})

            if (validationResult.error) {
                return await this.returnValidationError(ctx)
            }

            const registerControllerRequest = new RegisterControllerRequest({UID})

            const controller = await this.controllerService.getControllerByUID(registerControllerRequest.UID)

            if (!controller) {
                ctx.status = 404
                return ctx.body = ""
            }

            const {accessKey, mode} = controller
            ctx.body = new RegisterControllerResponse({Key: accessKey, Mode: mode})
            ctx.status = 200
        }
        catch (e) {
            console.log('body: ', JSON.stringify(ctx.request.body))
            console.log('params: ', JSON.stringify(ctx.params))
            console.error(e)
            console.error(e.stack)
            ctx.status = 500
        }

    }

    async returnValidationError(ctx) {
        ctx.status = 400
        ctx.body = ""
    }

    async returnNotFound(ctx) {
        ctx.status = 404
        ctx.body = ""
    }

}

module.exports = AggregationController