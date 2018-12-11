const ControllerModel = require("../models/mongoose/models/ControllerModel")
const ControllerErrorModel = require("../models/mongoose/models/ControllerErrorModel")

/**
 * ControllerService, maintains {Controller} entity
 */
class ControllerService {

    constructor() {
        this.getControllerByUID = this.getControllerByUID.bind(this)
        this.addErrorToController = this.addErrorToController.bind(this)
    }

    /**
     * Creates {Controller}
     * @param UID {string}
     * @returns {Promise<ControllerModel>}
     */
    async getControllerByUID(UID) {
        const query = ControllerModel
            .find({
                uid: UID
            })

        return await query.findOne().exec()
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
