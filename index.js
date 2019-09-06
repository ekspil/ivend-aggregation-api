require("dotenv").config()
const logger = require("my-custom-logger")

const server = require("./app/Server")

server.start()
    .then(() => logger.info("Aggregation API successfully started"))
    .catch((e) => {
        logger.error("Failed to start Aggregation API. " + e)
        process.exit(1)
    })

const exitHandler = () => {
    server
        .stop()
        .then(() => {
            logger.info("Aggregation API has been stopped")
        })
        .catch((e) => {
            logger.error("Failed to stop Aggregation API." + e)
            logger.error(e)
        })
}

process.on("exit", exitHandler)
