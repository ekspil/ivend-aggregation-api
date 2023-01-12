const ControllerService = require("../services/ControllerService")
// const ValidationService = require("../services/ValidationService")
// const RegisterControllerRequest = require("../models/RegisterControllerRequest")
// const RegisterErrorRequest = require("../models/RegisterErrorRequest")
// const RegisterStateRequest = require("../models/RegisterStateRequest")
// const RegisterSaleRequest = require("../models/RegisterSaleRequest")
// const RegisterEventRequest = require("../models/RegisterEventRequest")
// const RegisterControllerResponse = require("../models/RegisterControllerResponse")

const logger = require("my-custom-logger")

/* eslint require-atomic-updates: 0 */

class CubeController {

    /**
     * CubeController
     */
    constructor() {
        this.controllerService = new ControllerService()
        this.registerSale = this.registerSale.bind(this)
    }


    async registerSale(ctx) {
        try {
            if(ctx.req.headers["Authorization"] !== "Bearer eyJBcGlMb2dpbklkIjoiYWI1MWRiYWYtYTQyZC00YzNkLThmNzEtY2M4NGRhMzdkYjdhIiwibmJmIjoxNjczNDgyNzA4LCJleHAiOjE2NzM0ODYzMDgsImlhdCI6MTY3MzQ4MjcwOCwiaXNzIjoiaWlrbyIsImF1ZCI6ImNsaWVudHMifQ"){
                return this.returnUnauthenticated(ctx)
            }

            logger.info(`aggregation_api_cube_sale ${JSON.stringify(ctx.request.body)})`)

        }
        catch (e) {
            if (e && e.response && Array.isArray(e.response.errors) && e.response.errors[0] && e.response.errors[0].message) {
                const {message} = e.response.errors[0]
                if (message === "Machine not found") {
                    return this.returnMachineNotFound(ctx)
                }
            }

            return this.returnInternalServerError(ctx, e)
        }

    }



    async returnMachineNotFound(ctx) {
        logger.error(`412 error at ${ctx.request.url}, body = ${JSON.stringify(ctx.request.body)}`)
        ctx.status = 412
        ctx.body = ""
    }

    async returnValidationError(ctx) {
        logger.error(`400 error at ${ctx.request.url}, body = ${JSON.stringify(ctx.request.body)}`)
        ctx.status = 400
        ctx.body = ""
    }

    async returnUnauthenticated(ctx) {
        logger.error(`401 error at ${ctx.request.url}, body = ${JSON.stringify(ctx.request.body)}`)
        ctx.status = 401
        ctx.body = ""
    }

    async returnNotFound(ctx) {
        logger.error(`401 error at ${ctx.request.url}, body = ${JSON.stringify(ctx.request.body)}`)
        ctx.status = 401
        ctx.body = ""
    }

    async returnInternalServerError(ctx, e) {

        const msg = `
        body: ${JSON.stringify(ctx.request.body)}
        params: ${JSON.stringify(ctx.params)}
        error: ${e.message || e}
        stack: ${e.stack}`

        logger.error(msg)

        ctx.body = ""
        ctx.status = 500
    }

}

module.exports = CubeController
