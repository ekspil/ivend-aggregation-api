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
        const {UID, Key, CheckTime, Items} = rawObj
        this.UID = UID || null
        this.Key = Key || null
        this.CheckTime = CheckTime || null
        this.Items = Items || null

        if (!this.UID || !this.Key || !this.CheckTime || !this.Items) {
            throw new Error("Some required arguments omitted in RegisterSaleRequest")
        }
    }
}

module.exports = RegisterSaleRequest