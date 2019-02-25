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
        const {UID, Key, CheckTime, Price, Pt, ButtonId} = rawObj

        this.UID = UID
        this.Key = Key
        this.CheckTime = CheckTime
        this.Price = Price
        this.Pt = Pt
        this.ButtonId = ButtonId

        if (!this.UID || !this.Key || !this.CheckTime || this.Price === undefined || this.Pt === undefined|| this.ButtonId === undefined) {
            throw new Error("Some required arguments omitted in RegisterSaleRequest")
        }
    }
}

module.exports = RegisterSaleRequest
