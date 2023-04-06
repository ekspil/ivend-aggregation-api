const ControllerService = require("../services/ControllerService")
// const ValidationService = require("../services/ValidationService")
// const RegisterControllerRequest = require("../models/RegisterControllerRequest")
// const RegisterErrorRequest = require("../models/RegisterErrorRequest")
// const RegisterStateRequest = require("../models/RegisterStateRequest")
// const RegisterSaleRequest = require("../models/RegisterSaleRequest")
// const RegisterEventRequest = require("../models/RegisterEventRequest")
// const RegisterControllerResponse = require("../models/RegisterControllerResponse")

const RegisterSaleRequest = require("../models/CubeRegisterSaleRequest")
const RegisterStateRequest = require("../models/CubeRegisterStateRequest")

const logger = require("my-custom-logger")
const fetch = require("node-fetch")

/* eslint require-atomic-updates: 0 */

class CubeController {

    /**
     * CubeController
     */
    constructor() {
        this.controllerService = new ControllerService()
        this.registerSale = this.registerSale.bind(this)
        this.registerEvent = this.registerEvent.bind(this)
        this.token = null
        setInterval(()=>{
            this.token = null
        }, 14 * 24 * 60 * 60 * 1000)
    }


    async registerSale(ctx) {
        try {
            if(ctx.req.headers["authorization"] !== `Bearer ${process.env.CUBE_TOKEN}`){
                return this.returnUnauthenticated(ctx)
            }

            logger.info(`aggregation_api_cube_sale ${JSON.stringify(ctx.request.body)})`)

            const registerSaleRequest = new RegisterSaleRequest(ctx.request.body)
            const controller = await this.controllerService.getControllerByUID(registerSaleRequest.UID)

            if (!controller) {
                return this.returnNotFound(ctx)
            }

            if (!controller.machine) {
                return this.returnMachineNotFound(ctx)
            }
            const sale = await this.controllerService.registerSale(registerSaleRequest)
            const {sqr, err} = sale

            if(err === "exist"){
                logger.error("cube_request_status: BILL_ALREADY_EXIST")
                ctx.body= {
                    error: "BILL_ALREADY_EXIST",
                    status: "ERROR",
                    qr: sqr
                }
                ctx.status = 200
                return
            }
            const body = {
                id: ctx.request.body.id,
                deviceId: ctx.request.body.deviceId,
                code: Buffer.from(sqr).toString("base64")
            }
            let token
            if(this.token){
                token = this.token
            }
            else {
                token = await this.getToken()
                this.token = token
            }

            if(!token) {
                logger.error("cube_request_status: TOKEN_NOT_SET")
                ctx.body= {
                    error: "QR_CODE_DID_NOT_SEND",
                    status: "ERROR",
                    qr: sqr
                }
                ctx.status = 200
                return
            }
            const url = "https://api-cube-test.aqsi.ru/tlm/v1/sales/sendReceiptURLQRCode"
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(body)
            })

            if (!(response.status === 200 || response.status === 201)) {
                logger.error("cube_request_status: " + response.status)
                ctx.body= {
                    error: "QR_CODE_DID_NOT_SEND",
                    status: "ERROR",
                    qr: sqr
                }
                ctx.status = 200
            }
            else{

                ctx.body= {
                    error: err,
                    status: "SUCCESS",
                    qr: sqr
                }
                ctx.status = 200

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
    async registerEvent(ctx) {
        try {
            if(ctx.req.headers["authorization"] !== `Bearer ${process.env.CUBE_TOKEN}`){
                return this.returnUnauthenticated(ctx)
            }

            logger.info(`aggregation_api_cube_event ${JSON.stringify(ctx.request.body)})`)

            if(ctx.request.body.status === "offline") {

                ctx.body={
                    error: null,
                    status: "SUCCESS"
                }
                ctx.status = 200
                return
            }
            const registerStateRequest = new RegisterStateRequest(ctx.request.body)


            const controller = await this.controllerService.getControllerByUID(registerStateRequest.UID)

            if (!controller) {
                return this.returnNotFound(ctx)
            }


            await this.controllerService.registerState(registerStateRequest)
            ctx.body={
                error: null,
                status: "SUCCESS"
            }
            ctx.status = 200

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

    async getToken() {
        return this.controllerService.getCubeToken()
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
        logger.error(`413 error at ${ctx.request.url}, body = ${JSON.stringify(ctx.request.body)}`)
        ctx.status = 413
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
