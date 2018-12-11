class RegisterErrorRequest {

    /**
     * RegisterErrorRequest. Represent request for registerError method
     *
     * @param rawObj {object} raw object
     *
     * @returns {RegisterErrorRequest} registerErrorRequest instance
     * @throws {Error} throws on invalid rawObj
     */
    constructor(rawObj) {
        const {UID, Key, ErrorTime, Msg} = rawObj
        this.UID = UID || null
        this.Key = Key || null
        this.ErrorTime = ErrorTime || null
        this.Msg = Msg || null

        if (!this.UID || !this.Key || !this.ErrorTime || !this.Msg) {
            throw new Error("Some required arguments omitted in RegisterErrorRequest")
        }
    }
}

module.exports = RegisterErrorRequest