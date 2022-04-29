const {GraphQLClient} = require("graphql-request")
// ... or create a GraphQL client instance to send requests
const client = new GraphQLClient(process.env.GRAPHQL_API_URL, {
    headers: {
        Authorization: process.env.AUTH_HEADER_STRING
    }
})

/**
 * ControllerService, maintains {Controller} entity
 */
class ControllerService {

    constructor() {
        this.getControllerByUID = this.getControllerByUID.bind(this)
        this.authController = this.authController.bind(this)
        this.registerError = this.registerError.bind(this)
        this.registerSale = this.registerSale.bind(this)
        this.registerState = this.registerState.bind(this)
    }

    /**
     * Creates {Controller}
     * @param UID {string}
     * @returns {Promise<ControllerModel>}
     */
    async getControllerByUID(UID) {
        const query = `
        query {
          controller: getControllerByUID(uid: "${UID}") {
            uid
            mode
            accessKey
            machine {
                id
            }
          }
        }
        `


        const data = await client.request(query)

        if (!data.controller) {
            return null
        }


        return data.controller
    }

    /**
     * Creates {Controller}
     * @param IMEI {string}
     * @returns {Promise<string>}
     */
    async getControllerUIDByIMEI(IMEI) {
        const query = `
        query {
          uid: getControllerUIDByIMEI(imei: "${IMEI}")
        }
        `


        const data = await client.request(query)

        if (!data.uid) {
            return null
        }

        return data.uid
    }


    /**
     * Auths {Controller}
     * @param registerControllerRequest {RegisterControllerRequest}
     * @returns {Promise<ControllerModel>}
     */
    async authController(registerControllerRequest) {
        const {UID, FW, IMSI} = registerControllerRequest

        const query = `
        mutation($input: AuthControllerInput!) {
          authController(input: $input) {
            accessKey
            mode
            registrationTime
            bankTerminalMode
          }
        }
        `

        const variables = {
            input: {
                controllerUid: UID,
                firmwareId: FW,
                imsi: IMSI
            }
        }

        const data = await client.request(query, variables)

        if (!data.authController) {
            throw new Error("Failed to auth controller, authController returned null")
        }

        return data.authController
    }


    /**
     * Creates {Controller}
     * @param registerStateRequest {RegisterStateRequest}
     * @returns {Promise<ControllerModel>}
     */
    async registerState(registerStateRequest) {
        const query = `
        mutation($input: ControllerStateInput!) {
          registerControllerState(input: $input) {
            id
          }
        }
        `

        const {ch, bh, cv, bv, bus, ms, ar} = registerStateRequest.State
        const [dex1Status, dex2Status, exeStatus, mdbStatus] = bus.split("")

        const BusStatusMap = {
            "0": "DISABLED",
            "1": "OK",
            "2": "ERROR",
        }

        const SignalStrengthMap = {
            "0": "BAD",
            "1": "MEDIUM",
            "2": "GOOD",
        }

        const variables = {
            input: {
                controllerUid: registerStateRequest.UID,
                coinAcceptorStatus: BusStatusMap[ch],
                billAcceptorStatus: BusStatusMap[bh],
                coinAmount: cv,
                billAmount: bv,
                attentionRequired: ar || 0,
                dex1Status: BusStatusMap[dex1Status],
                dex2Status: BusStatusMap[dex2Status],
                exeStatus: BusStatusMap[exeStatus],
                mdbStatus: BusStatusMap[mdbStatus],
                signalStrength: SignalStrengthMap[ms]
            }
        }

        const data = await client.request(query, variables)

        if (!data.registerControllerState) {
            throw new Error("Failed to update controller state, registerControllerState returned null")
        }

        return data.registerControllerState
    }

    /**
     * Registers the sale
     * @param registerSaleRequest {RegisterSaleRequest}
     * @returns {Promise<void>}
     */
    async registerSale(registerSaleRequest) {
        const query = `
        mutation($input: SaleEventInput!) {
          registerSale(input: $input) {
            id,
            sqr,
            err,
            receipt {
                id
            }
          }
        }
        `

        const {UID, Pt, Price, ButtonId, CheckTime} = registerSaleRequest

        let type

        switch (Pt) {
            case 0:
                type = "CASH"
                break
            case 1:
                type = "CASHLESS"
                break
            default:
                throw new Error("Unknown payment type (Pt): " + Pt)
        }

        const variables = {
            input: {
                controllerUid: UID,
                type,
                price: Price,
                buttonId: ButtonId,
                timestamp: Number(CheckTime) * 1000
            }
        }

        const data = await client.request(query, variables)

        if (!data.registerSale) {
            throw new Error("Failed to register sale, registerSale returned null")
        }

        return data.registerSale
    }


    /**
     * Registers the controller error
     * @param registerErrorRequest {RegisterErrorRequest}
     * @returns {Promise<ControllerModel>}
     */
    async registerError(registerErrorRequest) {
        const query = `
        mutation($input: ControllerErrorInput!) {
          registerControllerError(input: $input) {
            id
          }
        }
        `

        const {UID, ErrorTime, Msg} = registerErrorRequest


        const variables = {
            input: {
                controllerUid: UID,
                message: Msg,
                errorTime: Number(ErrorTime)
            }
        }

        const data = await client.request(query, variables)

        if (!data.registerControllerError) {
            throw new Error("Failed to register error, registerError returned null")
        }
    }

    /**
     * Registers the controller event
     * @param registerEventRequest {RegisterEventRequest}
     * @returns {Promise<?>}
     */
    async registerEvent(registerEventRequest) {
        const query = `
        mutation($input: RegisterEventInput!) {
          registerEvent(input: $input) {
            id
          }
        }
        `

        const {UID, EventTime, Code} = registerEventRequest

        if(Code !== 2) {
            throw new Error("Unknown event code")
        }

        const timestamp = Number(EventTime + "000")

        if(new Date(timestamp) > new Date()) {
            throw new Error("Encashment timestamp cannot be in future")
        }

        const variables = {
            input: {
                controllerUid: UID,
                eventType: "ENCASHMENT",
                timestamp
            }
        }

        const data = await client.request(query, variables)

        if (!data.registerEvent) {
            throw new Error("Failed to register error, registerError returned null")
        }
    }
}

module.exports = ControllerService
