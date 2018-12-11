const mongoose = require('mongoose');
const ControllerModel = require('../../app/models/mongoose/models/ControllerModel')

const registerControllerTestDatabaseURL = `${process.env.MONGODB_URL}_register_error`

const request = require("supertest")

const App = require("../../app/App")

const path = "/api/v1/register/error"

let callback

async function preloadData() {
    //preload fake data

    const controllers = [
        {
            uid: "FIRST_TEST_UID",
            accessKey: "first_access_key",
            mode: "mdb"
        }
    ]

    const db = await mongoose.connect(registerControllerTestDatabaseURL);

    const savedControllers = await Promise.all(controllers.map(async controller => {
        const controllerModel = new ControllerModel(controller)
        return await controllerModel.save()
    }))

    await db.disconnect()
}

async function flushData() {
    const db = await mongoose.connect(registerControllerTestDatabaseURL);

    await ControllerModel.deleteMany({}).exec()

    await db.disconnect()
}

beforeAll(async () => {
    await preloadData();

    await App.start(registerControllerTestDatabaseURL)
    callback = App.getCallback()
})

afterAll(async () => {
    await App.stop()

    await flushData()
})


describe("RegisterError", () => {

    describe("RegisterError - Bad Request", () => {

        test("RequestBody is empty", async () => {
            const response = await request.agent(callback)
                .post(path)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(400)
        })

        test("RequestBody is empty string", async () => {
            const requestBody = ''

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(400)
        })

        test("RequestBody - null UID", async () => {
            const requestBody = {
                "UID": null,
                "Key": "string",
                "ErrorTime": 0,
                "Msg": "string"
            }

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(400)
        })


        test("RequestBody - null Key", async () => {
            const requestBody = {
                "UID": "string",
                "Key": null,
                "ErrorTime": 0,
                "Msg": "string"
            }

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(400)
        })


        test("RequestBody - null ErrorTime", async () => {
            const requestBody = {
                "UID": "string",
                "Key": "string",
                "ErrorTime": null,
                "Msg": "string"
            }

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(400)
        })

        test("RequestBody - null Msg", async () => {
            const requestBody = {
                "UID": "string",
                "Key": "string",
                "ErrorTime": 0,
                "Msg": null
            }

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(400)
        })

        test("RequestBody - ErrorTime is string", async () => {
            const requestBody = {
                "UID": "string",
                "Key": "string",
                "ErrorTime": "string",
                "Msg": "Message"
            }

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(400)
        })

        test("RequestBody - ErrorTime is not timestamp (zero)", async () => {
            const requestBody = {
                "UID": "string",
                "Key": "string",
                "ErrorTime": 0,
                "Msg": "Message"
            }

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(400)
        })

        test("RequestBody - ErrorTime is not timestamp (seconds instead of millis)", async () => {
            const requestBody = {
                "UID": "string",
                "Key": "string",
                "ErrorTime": 1544559117,
                "Msg": "Message"
            }

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(400)
        })

    })

    describe("RegisterError - Unauthenticated", () => {

        test("RequestBody - such UID not found", async () => {
            const requestBody = {
                "UID": "test",
                "Key": "test",
                "ErrorTime": 1544559117000,
                "Msg": "string"
            }

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(401)
        })

        test("RequestBody - key does not match", async () => {
            const requestBody = {
                "UID": "FIRST_TEST_UID",
                "Key": "key_not_match",
                "ErrorTime": 1544559117000,
                "Msg": "string"
            }

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(401)
        })

    })

    describe("RegisterError - Success", () => {

        test("Success", async () => {
            const requestBody = {
                "UID": "FIRST_TEST_UID",
                "Key": "first_access_key",
                "ErrorTime": 1544559117000,
                "Msg": "Test string"
            }

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(200)
        })

    })

})
