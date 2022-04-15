const { crc16 } = require("easy-crc")
const ControllerService = require("../services/ControllerService")
const TelemetronEventRequest = require("../models/TelemetronEventRequest")
const RegisterSaleRequest = require("../models/TelemetronRegisterSaleRequest")
const RegisterStateRequest = require("../models/TelemetronRegisterStateRequest")

const logger = require("my-custom-logger")

/* eslint require-atomic-updates: 0 */

class AggregationController {

    /**
     * AggregationController
     */
    constructor() {
        this.controllerService = new ControllerService()
        this.registerEvent = this.registerEvent.bind(this)
        this.registerEventExternal = this.registerEventExternal.bind(this)
        this.pingResponse = this.pingResponse.bind(this)
    }

    async registerEventExternal(ctx) {
        logger.info(`telemetron_test_external body: ${JSON.stringify(ctx.request.body)}, headers: ${JSON.stringify(ctx.headers)}`)
    }
    async registerEvent(ctx) {
        logger.info(`telemetron_test_full body: ${JSON.stringify(ctx.request.body)}, headers: ${JSON.stringify(ctx.headers)}`)
        try {
            if( !ctx.headers || !ctx.headers["x-key"] || ctx.headers["x-key"] !== process.env.TELEMETRON_KEY ){
                return this.returnUnauthenticated(ctx)
            }

            const telemetronEventRequest = new TelemetronEventRequest(ctx.request.body)



            const uid = await this.controllerService.getControllerUIDByIMEI(telemetronEventRequest.imei)
            if(!uid) {

                return this.returnUnauthenticated(ctx)
            }



            const controller = await this.controllerService.getControllerByUID(telemetronEventRequest.imei)

            if (!controller) {
                return this.returnUnauthenticated(ctx)
            }

            if (!controller.machine) {
                return this.returnMachineNotFound(ctx)
            }


            if(telemetronEventRequest.reason === "ping" && !telemetronEventRequest.mdb_product){
                const registerStateRequest = new RegisterStateRequest(telemetronEventRequest)
                await this.controllerService.registerState(registerStateRequest)
                return await this.pingResponse(ctx)
            }

            if(telemetronEventRequest.mdb_product){

                for(let sale of telemetronEventRequest.mdb_product){
                    const registerSaleRequest = new RegisterSaleRequest(sale, uid)
                    await this.controllerService.registerSale(registerSaleRequest)
                }
                return await this.pingResponse(ctx)
            }


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

    async pingResponse(ctx, timeZone = 3){
        const date = new Date()
        date.setUTCHours(date.getUTCHours() + timeZone)

        const stringDate = `${date.getUTCFullYear()}-${("0" + (date.getUTCMonth()+1)).slice(-2)}-${("0" + date.getUTCDate()).slice(-2)} ${("0" + date.getUTCHours()).slice(-2)}:${("0" + date.getUTCMinutes()).slice(-2)}:${("0" + date.getUTCSeconds()).slice(-2)}`

        ctx.body = `time=${stringDate}&status=ok`
        ctx.status = 200
        let value = crc16("ARC", ctx.body).toString(16).toUpperCase()
        ctx.set({
            "content-type": "text/html; charset=UTF-8",
            "X-Checksum": value
        })
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
