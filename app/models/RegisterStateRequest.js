class RegisterStateRequest {

    /**
     * RegisterStateRequest. Represent request for registerState method
     *
     * @param rawObj {object} raw object with UID
     *
     * @returns {RegisterControllerRequest} registerControllerRequest instance
     * @throws {Error} throws on invalid rawObj
     */
    constructor(rawObj) {
        const {UID, Key, State, FW} = rawObj
        this.UID = UID || null
        this.Key = Key || null
        this.State = State || null
        this.FW = FW || null

        if (!UID || !Key || !State || !FW) {
            throw new Error("UID and Key and State and FW are required")
        }
    }
}

module.exports = RegisterStateRequest
