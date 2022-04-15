class RegisterSaleRequest {

    /**
     * RegisterSaleRequest. Represent request for registerSale method
     *
     * @param rawObj {string} raw object
     *
     * @returns {RegisterSaleRequest} registerSaleRequest instance
     * @throws {Error} throws on invalid rawObj
     */
    constructor(rawObj, UID) {
        const arr = rawObj.split(",")
        //const {UID, Pt, Price, ButtonId, CheckTime} = registerSaleRequest
        let Pt
        switch (arr[4]) {
            case "cash":
                Pt = 0
                break
            case "cashless":
                Pt = 1
                break
            default:
                Pt = 0
                break
        }

        this.UID = UID
        this.CheckTime = (new Date(arr[2]).getTime() / 1000).toFixed(0)
        this.Price = Number(arr[1])
        this.Pt = Pt
        this.ButtonId = arr[0]

        if (!this.UID || !this.CheckTime || this.Price === undefined || this.Pt === undefined|| this.ButtonId === undefined) {
            throw new Error("Some required arguments omitted in RegisterSaleRequest")
        }
    }
}

module.exports = RegisterSaleRequest