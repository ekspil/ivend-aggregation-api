const mongoose = require('mongoose');
const ControllerModel = require('../../app/models/mongoose/models/ControllerModel')

const registerControllerTestDatabaseURL = `${process.env.MONGODB_URL}_register_controller`

const request = require("supertest")

const App = require("../../app/App")

const path = "/api/v1/registerController"

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


describe("RegisterController", () => {

    describe("RegisterController - Bad Request", () => {

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
                UID: null
            }

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(400)
        })


        test("RequestBody - UID is number", async () => {
            const requestBody = {
                UID: 123123123
            }

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(400)
        })

    })

    describe("RegisterController - Not Found", () => {

        test("RegisterController empty requestBody", async () => {
            const requestBody = {UID: "invalid_uid"}

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(404)
        })

    })

    describe("RegisterController - Not Found", () => {

        test("RegisterController empty requestBody", async () => {
            const requestBody = {UID: "invalid_uid"}

            const response = await request.agent(callback)
                .post(path)
                .send(requestBody)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")

            expect(response.status).toEqual(404)
        })

    })

})
