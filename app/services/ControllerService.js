const {request, GraphQLClient} = require('graphql-request')
// ... or create a GraphQL client instance to send requests
const client = new GraphQLClient(process.env.GRAPHQL_API_URL, {
    headers: {
        "Authorization": "Basic Y29udHJvbGxlcjpjb250cm9sbGVy"
    }
})

/**
 * ControllerService, maintains {Controller} entity
 */
class ControllerService {

    constructor() {
        this.getControllerByUID = this.getControllerByUID.bind(this)
        this.authController = this.authController.bind(this)
        this.addErrorToController = this.addErrorToController.bind(this)
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
     * @param UID {string}
     * @returns {Promise<ControllerModel>}
     */
    async authController(UID) {
        const query = `
        mutation {
          authController(uid: "${UID}") {
            accessKey
            mode
          }
        }
        `

        const data = await client.request(query)

        if(!data.authController) {
            return null
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
        mutation($input: ControllerStateInput) {
          registerControllerState(input: $input) {
            id
          }
        }
        `

        const {ch, bh, cv, bv, bus, ms} = registerStateRequest.State
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
    }


    /**
     * Adds error to controller
     * @param registerErrorRequest {RegisterErrorRequest}
     * @returns {Promise<ControllerModel>}
     */
    async addErrorToController(registerErrorRequest) {
        const errorTime = new Date(registerErrorRequest.ErrorTime)
        const {UID} = registerErrorRequest

        const controller = await ControllerModel
            .find({
                uid: UID
            })
            .findOne()
            .exec()

        controller.controllerErrors.push(new ControllerErrorModel({errorTime, message: registerErrorRequest.Msg}));

        return await controller.save()
    }
}

module.exports = ControllerService
