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


            const noActionStatuses = ["poweroff", "reset", "enable"]
            const actionStatuses = ["poweron"]
            const controller = await this.controllerService.getControllerByUID(uid)

            if (!controller) {
                return this.returnUnauthenticated(ctx)
            }

            if (!controller.machine) {
                return this.returnMachineNotFound(ctx)
            }

            //Ответ на запрос фискальных данных
            if(telemetronEventRequest.reason === "ping" && telemetronEventRequest.vend_tx_id){
                return await this.pingResponse(ctx, 3, "&fiscal=t%3D20190520T1356%26s%3D4.02%26fn%3D9999078900001341%26i%3D2853%26fp%3D599041704%26n%3D1")
            }

            //Инкассация
            if(telemetronEventRequest.reason === "button" && telemetronEventRequest.events === "TIO"){
                await this.controllerService.registerEvent({UID: uid, EventTime: (new Date(telemetronEventRequest.time + " +0300").getTime() / 1000).toFixed(0), Code: 2})
                return await this.pingResponse(ctx)
            }

            //Регистрация - ловим конфиг пакет
            if(telemetronEventRequest.version && telemetronEventRequest.simnumber && !telemetronEventRequest.mdb_product){
                await this.controllerService.authController({UID: uid, FW: telemetronEventRequest.version || "vendista v1", IMSI: telemetronEventRequest.simnumber})
                return await this.pingResponse(ctx)
            }

            //Ответ на пинг
            if(telemetronEventRequest.reason === "ping" && !telemetronEventRequest.mdb_product){
                const registerStateRequest = new RegisterStateRequest(telemetronEventRequest, uid)
                await this.controllerService.registerState(registerStateRequest)
                return await this.pingResponse(ctx)
            }

            //Генерим конфиг пакет
            if(actionStatuses.includes(telemetronEventRequest.reason) && !telemetronEventRequest.mdb_product){
                //await this.controllerService.authController({UID: uid, FW: "vendista v1", IMSI: ""})
                return await this.pingResponse(ctx, 3 , "&get=config")
            }

            //Ничего не делаем на эти пакеты
            if(noActionStatuses.includes(telemetronEventRequest.reason) && !telemetronEventRequest.mdb_product){
                return await this.pingResponse(ctx)
            }

            if(telemetronEventRequest.mdb_product){
                let result

                for(let sale of telemetronEventRequest.mdb_product){
                    const registerSaleRequest = new RegisterSaleRequest(sale, uid)
                    result = await this.controllerService.registerSale(registerSaleRequest)
                }
                let command
                if(result.receipt && result.receipt.id){
                    command = `&vend_tx_id=${result.receipt.id}`
                }
                return await this.pingResponse(ctx, 3, command)
            }

            return await this.pingResponse(ctx)


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

    async pingResponse(ctx, timeZone = 3, command){
        const date = new Date()
        date.setUTCHours(date.getUTCHours() + timeZone)

        const stringDate = `${date.getUTCFullYear()}-${("0" + (date.getUTCMonth()+1)).slice(-2)}-${("0" + date.getUTCDate()).slice(-2)} ${("0" + date.getUTCHours()).slice(-2)}:${("0" + date.getUTCMinutes()).slice(-2)}:${("0" + date.getUTCSeconds()).slice(-2)}`

        ctx.body = `time=${stringDate}&status=ok`
        if(command){
            ctx.body += command
        }


        logger.info(`telemetron_ctx_body: ${ctx.body}`)
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
