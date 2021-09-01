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
        const {UID, FW, IMSI} = rawObj
        this.UID = UID || null
        this.FW = FW || null
        this.IMSI = IMSI || null

        if (!this.UID || !this.FW) {
            throw new Error("UID and FW are required")
        }
    }
}

module.exports = RegisterControllerRequest