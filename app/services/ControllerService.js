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
