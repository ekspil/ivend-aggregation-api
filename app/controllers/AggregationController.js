const ControllerService = require("../services/ControllerService")
const ValidationService = require("../services/ValidationService")
const RegisterControllerRequest = require("../models/RegisterControllerRequest")
const RegisterErrorRequest = require("../models/RegisterErrorRequest")
const RegisterControllerResponse = require("../models/RegisterControllerResponse")


class AggregationController {

    /**
     * AggregationController
     */
    constructor() {
        this.controllerService = new ControllerService();

        this.registerController = this.registerController.bind(this)
        this.registerError = this.registerError.bind(this)
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
            return this.returnInternalServerError(ctx, e)
        }

    }

    async registerError(ctx) {
        try {
            const {UID, Key, ErrorTime, Msg} = ctx.request.body

            const validationResult = ValidationService.validateRegisterErrorRequest({UID, Key, ErrorTime, Msg})

            if (validationResult.error) {
                return await this.returnValidationError(ctx)
            }

            const registerErrorRequest = new RegisterErrorRequest({UID, Key, ErrorTime, Msg})

            const controller = await this.controllerService.getControllerByUID(registerErrorRequest.UID)

            if (!controller || (controller && controller.accessKey !== registerErrorRequest.Key)) {
                return this.returnUnauthenticated(ctx)
            }

            await this.controllerService.addErrorToController(registerErrorRequest)

            ctx.body = ""
            ctx.status = 200
        }
        catch (e) {
            return this.returnInternalServerError(ctx, e)
        }

    }

    async returnValidationError(ctx) {
        ctx.status = 400
        ctx.body = ""
    }

    async returnUnauthenticated(ctx) {
        ctx.status = 401
        ctx.body = ""
    }

    async returnNotFound(ctx) {
        ctx.status = 404
        ctx.body = ""
    }

    async returnInternalServerError(ctx, e) {
        console.log('body: ', JSON.stringify(ctx.request.body))
        console.log('params: ', JSON.stringify(ctx.params))
        console.error(e)
        console.error(e.stack)
        ctx.body = ""
        ctx.status = 500
    }

}

module.exports = AggregationController