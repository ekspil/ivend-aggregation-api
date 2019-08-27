class RegisterEventRequest {

    constructor(rawObj) {
        const {UID, Key, EventTime, Code} = rawObj
        this.UID = UID || null
        this.Key = Key || null
        this.EventTime = EventTime || null
        this.Code = Code || null
    }
}

module.exports = RegisterEventRequest
