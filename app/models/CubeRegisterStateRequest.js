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
        const {deviceId} = rawObj

        this.UID = "400-" + deviceId
        this.State = {
            ch: "0",
            bh: "1",
            cv: 0,
            bv: 0,
            bus: "001",
            ms: "0",
            ar: 0
        }

        if (!deviceId) {
            throw new Error("UID are required")
        }
    }
}

module.exports = RegisterStateRequest
