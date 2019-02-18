class RegisterSaleRequest {

    /**
     * RegisterSaleRequest. Represent request for registerSale method
     *
     * @param rawObj {string} raw object
     *
     * @returns {RegisterSaleRequest} registerSaleRequest instance
     * @throws {Error} throws on invalid rawObj
     */
    constructor(rawObj) {
        const {UID, Key, CheckTime, ButtonId} = rawObj

        this.UID = UID
        this.Key = Key
        this.CheckTime = CheckTime
        this.ButtonId = ButtonId

        if (!this.UID || !this.Key || !this.CheckTime || this.ButtonId === undefined) {
            throw new Error("Some required arguments omitted in RegisterSaleRequest")
        }
    }
}

module.exports = RegisterSaleRequest
