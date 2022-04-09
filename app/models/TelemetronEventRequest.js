class TelemetronEventRequest {

    constructor(rawObj) {
        const {imei, time, s, mdb, iccid, reason, qlt, bat, exe, mdb_product} = rawObj
        this.imei = imei || null
        this.time = time || null
        this.s = s || null
        this.mdb = mdb || null
        this.iccid = iccid || null
        this.reason = reason || null
        this.qlt = qlt || null
        this.bat = bat || null
        this.exe = exe || null
        this.mdb_product = (mdb_product && mdb_product[0]) ? mdb_product[0] : null
    }
}

module.exports = TelemetronEventRequest
