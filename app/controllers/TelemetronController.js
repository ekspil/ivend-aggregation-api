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
        this.checkDoubles = this.checkDoubles.bind(this)
        this.clearRequests = this.clearRequests.bind(this)
        this.requests = []

        setInterval(this.clearRequests, 5000)
    }



    checkDoubles(telemetronEventRequest) {

        let productsLength = 0
        if(telemetronEventRequest.mdb_product) productsLength = telemetronEventRequest.mdb_product.length

        const string = `${telemetronEventRequest.imei}-${telemetronEventRequest.reason}-${telemetronEventRequest.time}-${productsLength}`


        const double = this.requests.find(item => item.string === string)

        if(double) return false

        this.requests.push({
            string,
            time: (new Date()).getTime()
        })
        return true
    }
    clearRequests() {

        const checkTime = (new Date()).getTime() - 10000
        this.requests = this.requests.filter(item => {
            if(item.time < checkTime) return false
            return true
        })

    }


    async registerEventExternal(ctx) {
        logger.info(`telemetron_test_external body: ${JSON.stringify(ctx.request.body)}, headers: ${JSON.stringify(ctx.headers)}`)
    }
    async registerEvent(ctx) {
        logger.info(`telemetron_test_full body: ${JSON.stringify(ctx.request.body)}, headers: ${JSON.stringify(ctx.headers)}`)
        try {
            if( !ctx.headers || !ctx.headers["x-key"] || ctx.headers["x-key"] !== process.env.TELEMETRON_KEY ){
                return await this.pingResponse(ctx, 3, "&error=true")
            }

            const telemetronEventRequest = new TelemetronEventRequest(ctx.request.body)



            const noActionStatuses = ["poweroff", "reset", "enable"]
            const actionStatuses = ["poweron"]


            //Ничего не делаем на эти пакеты
            if(noActionStatuses.includes(telemetronEventRequest.reason) && !telemetronEventRequest.mdb_product){
                return await this.pingResponse(ctx)
            }


            const doubleRequest = this.checkDoubles(telemetronEventRequest)
            if(!doubleRequest){
                return await this.pingResponse(ctx)
            }



            const uid = await this.controllerService.getControllerUIDByIMEI(telemetronEventRequest.imei, telemetronEventRequest.reason)
            if(!uid) {

                return await this.pingResponse(ctx, 3, "&error=true")
            }

            const controller = await this.controllerService.getControllerByUID(uid)

            if (!controller) {
                return await this.pingResponse(ctx, 3, "&error=true")
            }

            if (!controller.machine) {
                return await this.pingResponse(ctx, 3, "&error=true")
            }

            //Ответ на запрос фискальных данных
            if(telemetronEventRequest.reason === "ping" && telemetronEventRequest.vend_tx_id){
                return await this.pingResponse(ctx, 3, `&fiscal=https://cabinet.ivend.pro/bill/${telemetronEventRequest.vend_tx_id}`)
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

            if(telemetronEventRequest.mdb_product){
                let sale
                for(let s of telemetronEventRequest.mdb_product){
                    if(!sale) {
                        sale = s
                        continue
                    }
                    const arr = sale.split(",")
                    const arrNext = s.split(",")
                    if (arr[1] === "free") arr[1] = 0.0
                    if (arrNext[1] === "free") arrNext[1] = 0.0

                    arr[1] = String(Number(arr[1]) + Number(arrNext[1]))
                    sale = arr.join(",")

                }


                const registerSaleRequest = new RegisterSaleRequest(sale, uid)
                const result = await this.controllerService.registerSale(registerSaleRequest)
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
