

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

        const {deviceId, processedAt, Price, paymentType, slotInfo} = rawObj


        this.UID = "400-" + deviceId
        this.CheckTime = (new Date(processedAt).getTime() / 1000).toFixed(0)
        this.Price = Price
        this.Pt = paymentType
        this.ButtonId = slotInfo.slotId || 0

        if (!this.UID || !this.CheckTime || this.Price === undefined || this.Pt === undefined|| this.ButtonId === undefined) {
            throw new Error("Some required arguments omitted in RegisterSaleRequest")
        }
    }
}

module.exports = RegisterSaleRequest
