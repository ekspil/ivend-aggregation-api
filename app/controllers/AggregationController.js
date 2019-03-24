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
            const validationResult = ValidationService.validateRegisterControllerRequest(ctx.request.body)

            const registerControllerRequest = new RegisterControllerRequest(ctx.request.body)

            if (validationResult.error) {
                return await this.returnValidationError(ctx)
            }

            const {accessKey, mode} = await this.controllerService.authController(registerControllerRequest)

            const now = new Date()

            const date = {
                year: (now.getFullYear() + '').padStart(2, 0),
                month: ((now.getMonth() + 1) + '').padStart(2, 0),
                date: (now.getDate() + '').padStart(2, 0),
                hours: (now.getHours() + '').padStart(2, 0),
                minutes: (now.getMinutes() + '').padStart(2, 0),
                seconds: (now.getSeconds() + '').padStart(2, 0),
            }

            const SDT = `${date.year}-${date.month}-${date.date} ${date.hours}:${date.minutes}:${date.seconds}`

            ctx.body = new RegisterControllerResponse({Key: accessKey, Mode: mode, SDT})
            ctx.status = 200
        }
        catch (e) {
            return this.returnInternalServerError(ctx, e)
        }

    }

    async registerError(ctx) {
        try {
            const registerErrorRequest = new RegisterErrorRequest(ctx.request.body)

            const validationResult = ValidationService.validateRegisterErrorRequest(registerErrorRequest)

            if (validationResult.error) {
                return await this.returnValidationError(ctx)
            }

            const controller = await this.controllerService.getControllerByUID(registerErrorRequest.UID)

            if (!controller || (controller && controller.accessKey !== registerErrorRequest.Key)) {
                return this.returnUnauthenticated(ctx)
            }

            await this.controllerService.registerError(registerErrorRequest)

            ctx.body = ""
            ctx.status = 200
        }
        catch (e) {
            return this.returnInternalServerError(ctx, e)
        }

    }

    async registerState(ctx) {
        try {
            const registerStateRequest = new RegisterStateRequest(ctx.request.body)

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
            const registerSaleRequest = new RegisterSaleRequest(ctx.request.body)

            const validationResult = ValidationService.validateRegisterSaleRequest(registerSaleRequest)

            if (validationResult.error) {
                return await this.returnValidationError(ctx)
            }

            const controller = await this.controllerService.getControllerByUID(registerSaleRequest.UID)

            if (!controller || (controller && controller.accessKey !== registerSaleRequest.Key)) {
                return this.returnUnauthenticated(ctx)
            }

            const sale = await this.controllerService.registerSale(registerSaleRequest)
            const {sqr} = sale

            ctx.body = {
                Check: {
                    status: "OK",
                    sqr
                }
            }
            ctx.status = 200
        }
        catch (e) {
            return this.returnInternalServerError(ctx, e)
        }

    }
    async returnValidationError(ctx) {
        console.log(`400 error at ${ctx.request.url}, body = ${JSON.stringify(ctx.request.body)}`)
        ctx.status = 400
        ctx.body = ""
    }

    async returnUnauthenticated(ctx) {
        console.log(`401 error at ${ctx.request.url}, body = ${JSON.stringify(ctx.request.body)}`)
        ctx.status = 401
        ctx.body = ""
    }

    async returnNotFound(ctx) {
        console.log(`404 error at ${ctx.request.url}, body = ${JSON.stringify(ctx.request.body)}`)
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
