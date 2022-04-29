class TelemetronEventRequest {

    constructor(rawObj) {
        const {imei, time, s, mdb, iccid, reason, qlt, bat, exe, mdb_product, version, simnumber, events, vend_tx_id} = rawObj
        this.imei = imei || null
        this.time = time || null
        this.s = s || null
        this.mdb = mdb || null
        this.iccid = iccid || null
        this.reason = reason || null
        this.qlt = qlt || null
        this.bat = bat || null
        this.exe = exe || null
        this.version = version || null
        this.events = events || null
        this.simnumber = simnumber || null
        this.mdb_product = mdb_product || null
        this.vend_tx_id = vend_tx_id || null
    }
}

module.exports = TelemetronEventRequest
