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
        const {UID, Key, State} = rawObj
        this.UID = UID || null
        this.Key = Key || null
        this.State = State || null

        if (!UID || !Key || !State) {
            throw new Error("UID and Key and State are required")
        }
    }
}

module.exports = RegisterStateRequest
