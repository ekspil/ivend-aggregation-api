require("dotenv").config()

const server = require("./app/Server")

server.start()
    .then(() => console.log("Aggregation API successfully started"))
    .catch((e) => {
        console.error("Failed to start Aggregation API. " + e)
        process.exit(1)
    })

const exitHandler = () => {
    server
        .stop()
        .then(() => {
            console.log("Aggregation API has been stopped")
        })
        .catch((e) => {
            console.error("Failed to stop Aggregation API." + e)
            console.error(e)
        })
}

process.on("exit", exitHandler)
