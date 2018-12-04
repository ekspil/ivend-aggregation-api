const ControllerModel = require("../models/mongoose/models/ControllerModel")

/**
 * ControllerService, maintains {Controller} entity
 */
class ControllerService {

    constructor() {
        this.getControllerByUID = this.getControllerByUID.bind(this)
    }

    /**
     * Creates {Bill}
     * @param UID {string}
     * @returns {Promise<ControllerModel>}
     */
    async getControllerByUID(UID) {
        const query = ControllerModel
            .find({
                UID: UID
            })

        return await query.findOne().exec()
    }
}

module.exports = ControllerService
