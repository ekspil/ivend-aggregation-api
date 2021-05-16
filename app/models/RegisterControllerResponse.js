class RegisterControllerResponse {

    /**
     * RegisterControllerResponse. Represent response for registerController method
     *
     * @param rawObj {object} raw object with Key and Mode
     *
     * @returns {RegisterControllerRequest} registerControllerRequest instance
     * @throws {Error} throws on wrong rawObj
     */
    constructor(rawObj) {
        const {Key, Mode, SDT, Terminal} = rawObj
        this.Key = Key || null
        this.Mode = Mode || null
        this.Terminal = Terminal || null
        this.SDT = SDT || null

        if (!this.Key || !this.Mode) {
            throw new Error("Key and mode are required")
        }
    }
}

module.exports = RegisterControllerResponse