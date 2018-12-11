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
        const {UID} = rawObj
        this.UID = UID || null

        if (!this.UID) {
            throw new Error("UID is required")
        }
    }
}

module.exports = RegisterControllerRequest