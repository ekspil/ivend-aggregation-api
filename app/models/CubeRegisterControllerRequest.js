class RegisterControllerRequest {

    /**
     * RegisterControllerRequest. Represent request for registerController method
     *
     * @param rawObj {object} raw object with UID
     *
     * @returns {RegisterControllerRequest} registerControllerRequest instance
     * @throws {Error} throws on invalid rawObj
     */
    constructor(rawObj) {
        const {deviceSerialNumber} = rawObj
        this.UID = deviceSerialNumber || null
        this.FW = "aqsi 1.0"
        this.IMSI = null

        if (!this.UID || !this.FW) {
            throw new Error("UID and FW are required")
        }
    }
}

module.exports = RegisterControllerRequest