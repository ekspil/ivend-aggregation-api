class RegisterStateRequest {

    //
    //     const {ch, bh, cv, bv, bus, ms, ar} = registerStateRequest.State
    // const [dex1Status, dex2Status, exeStatus, mdbStatus] = bus.split("")
    //
    // const BusStatusMap = {
    //     "0": "DISABLED",
    //     "1": "OK",
    //     "2": "ERROR",
    // }
    //
    // const SignalStrengthMap = {
    //     "0": "BAD",
    //     "1": "MEDIUM",
    //     "2": "GOOD",
    // }
    //
    // const variables = {
    //     input: {
    //         controllerUid: registerStateRequest.UID,
    //         coinAcceptorStatus: BusStatusMap[ch],
    //         billAcceptorStatus: BusStatusMap[bh],
    //         coinAmount: cv,
    //         billAmount: bv,
    //         attentionRequired: ar || 0,
    //         dex1Status: BusStatusMap[dex1Status],
    //         dex2Status: BusStatusMap[dex2Status],
    //         exeStatus: BusStatusMap[exeStatus],
    //         mdbStatus: BusStatusMap[mdbStatus],
    //         signalStrength: SignalStrengthMap[ms]
    //     }
    // }
    //const {imei, time, s, mdb, iccid, reason, qlt, bat, exe, mdb_product} = rawObj

    /**
     * RegisterStateRequest. Represent request for registerState method
     *
     * @param rawObj {object} raw object with UID
     *
     * @returns {RegisterControllerRequest} registerControllerRequest instance
     * @throws {Error} throws on invalid rawObj
     */
    constructor(rawObj, UID) {
        const {mdb, qlt, exe} = rawObj
        const SignalStrengthMap = (qlt) => {
            if(!qlt) return "0"
            if(qlt < 10) {
                return "0"
            }
            if(qlt < 25) {
                return "1"
            }
            return "2"
        }
        const BusStatusMap = (mdb, exe) => {
            let string = "00"
            if(exe === "ok") {
                string = string + "1"
            }
            else {
                string = string + "2"
            }
            if(mdb === "ok") {
                string = string + "1"
            }
            else {
                string = string + "2"
            }
            return string
        }

        this.UID = UID || null
        this.State = {
            ch: "0",
            bh: "1",
            cv: 0,
            bv: 0,
            bus: BusStatusMap(mdb, exe),
            ms: SignalStrengthMap(qlt),
            ar: 0
        }

        if (!UID) {
            throw new Error("UID are required")
        }
    }
}

module.exports = RegisterStateRequest
