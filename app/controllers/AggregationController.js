const ControllerService = require("../services/ControllerService")
const ValidationService = require("../services/ValidationService")
const RegisterControllerRequest = require("../models/RegisterControllerRequest")
const RegisterErrorRequest = require("../models/RegisterErrorRequest")
const RegisterStateRequest = require("../models/RegisterStateRequest")
const RegisterSaleRequest = require("../models/RegisterSaleRequest")
const RegisterControllerResponse = require("../models/RegisterControllerResponse")


class AggregationController {

    /**
     * AggregationController
     */
    constructor() {
        this.controllerService = new ControllerService();

        this.registerController = this.registerController.bind(this)
        this.registerState = this.registerState.bind(this)
        this.registerError = this.registerError.bind(this)
        this.registerSale = this.registerSale.bind(this)
    }

    async registerController(ctx) {
        try {
            const registerControllerRequest = new RegisterControllerRequest(ctx.request.body)

            const validationResult = ValidationService.validateRegisterControllerRequest(registerControllerRequest)

            if (validationResult.error) {
                return await this.returnValidationError(ctx)
            }

            const controller = await this.controllerService.getControllerByUID(registerControllerRequest.UID)

            if (!controller) {
                ctx.status = 404
                return ctx.body = ""
            }

            const {accessKey, mode} = await this.controllerService.authController(registerControllerRequest.UID)

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

    async registerState(ctx) {
        try {
            const {UID, Key, State} = ctx.request.body
            const registerStateRequest = new RegisterStateRequest({UID, Key, State})

            const validationResult = ValidationService.validateRegisterStateRequest(registerStateRequest)

            if (validationResult.error) {
                return await this.returnValidationError(ctx)
            }

            const controller = await this.controllerService.getControllerByUID(registerStateRequest.UID)

            if (!controller || (controller && controller.accessKey !== registerStateRequest.Key)) {
                return this.returnUnauthenticated(ctx)
            }

            await this.controllerService.registerState(registerStateRequest)

            ctx.body = ""
            ctx.status = 200
        }
        catch (e) {
            return this.returnInternalServerError(ctx, e)
        }

    }

    async registerSale(ctx) {
        try {
            const registerStateRequest = new RegisterSaleRequest(ctx.request.body)

            const validationResult = ValidationService.validateRegisterSaleRequest(registerStateRequest)

            if (validationResult.error) {
                return await this.returnValidationError(ctx)
            }

            const controller = await this.controllerService.getControllerByUID(registerStateRequest.UID)

            if (!controller || (controller && controller.accessKey !== registerStateRequest.Key)) {
                return this.returnUnauthenticated(ctx)
            }

            await this.controllerService.registerSale(registerStateRequest)

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
