const { crc16 } = require("easy-crc")
const ControllerService = require("../services/ControllerService")
const TelemetronEventRequest = require("../models/TelemetronEventRequest")

const logger = require("my-custom-logger")

/* eslint require-atomic-updates: 0 */

class AggregationController {

    /**
     * AggregationController
     */
    constructor() {
        this.controllerService = new ControllerService()
        this.registerEvent = this.registerEvent.bind(this)
    }


    async registerEvent(ctx) {
        logger.info(`telemetron_test body: ${JSON.stringify(ctx.request.body)}, headers: ${JSON.stringify(ctx.headers)}`)
        try {
            if( !ctx.headers || !ctx.headers["x-key"] || ctx.headers["x-key"] !== process.env.TELEMETRON_KEY ){
                return this.returnUnauthenticated(ctx)
            }
            logger.info(`telemetron_test auth ok`)
            const telemetronEventRequest = new TelemetronEventRequest(ctx.request.body)

            const uid = await this.controllerService.getControllerUIDByIMEI(telemetronEventRequest.imei)
            if(!uid) {
                logger.info(`telemetron_test imei not found ${telemetronEventRequest.imei}`)
                return this.returnUnauthenticated(ctx)
            }

            logger.info(`aggregation_api_register_event ${JSON.stringify(ctx.request.body)})`)


            const controller = await this.controllerService.getControllerByUID(telemetronEventRequest.imei)

            if (!controller) {
                return this.returnUnauthenticated(ctx)
            }

            if (!controller.machine) {
                return this.returnMachineNotFound(ctx)
            }

            //await this.controllerService.telemetronEvent(telemetronEventRequest)

            ctx.body = encodeURIComponent(`time=${new Date().toLocaleString("ru-RU")}&status=ok`)
            ctx.status = 200
            let value = crc16("ARC", ctx.body).toString(16).toUpperCase()
            ctx.set({
                "content-type": "application/x-www-form-urlencoded",
                "X-Checksum": value
            })
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
        ctx.set({
            "content-type": "application/x-www-form-urlencoded"
        })
        ctx.status = 412
        ctx.body = ""
    }

    async returnValidationError(ctx) {
        logger.error(`400 error at ${ctx.request.url}, body = ${JSON.stringify(ctx.request.body)}`)
        ctx.set({
            "content-type": "application/x-www-form-urlencoded"
        })
        ctx.status = 400
        ctx.body = ""
    }

    async returnUnauthenticated(ctx) {
        logger.error(`401 error at ${ctx.request.url}, body = ${JSON.stringify(ctx.request.body)}`)
        ctx.set({
            "content-type": "application/x-www-form-urlencoded"
        })
        ctx.status = 401
        ctx.body = ""
    }

    async returnNotFound(ctx) {
        logger.error(`404 error at ${ctx.request.url}, body = ${JSON.stringify(ctx.request.body)}`)
        ctx.set({
            "content-type": "application/x-www-form-urlencoded"
        })
        ctx.status = 404
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

module.exports = AggregationController
