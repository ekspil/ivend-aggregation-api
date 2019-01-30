const ApiModule = {}

const Koa = require("koa")
const mount = require("koa-mount")
const bodyParser = require("koa-bodyparser")
const Routes = require("./routes/Routes")
const AggregationController = require("./controllers/AggregationController")
const mongoose = require("mongoose")

const app = new Koa()

ApiModule.listen = (port) => {
    app.listen(port)
        .on("error", (err) => console.error(err))
}

ApiModule.getCallback = () => {
    return app.callback()
}

ApiModule.start = async (mongoDBURL) => {
    app.use(bodyParser())

    const aggregationController = new AggregationController()
    const router = Routes({aggregationController})

    app.use(async (ctx, next) => {
        if (ctx.request.method === "GET") {
            return await next()
        }

        const contentType = ctx.req.headers["content-type"]

        if (ctx.request.method !== 'GET' && contentType !== "application/json") {
            ctx.status = 400
            ctx.body = {code: 1, message: "Invalid Content-Type header. Only application/json is accepted"}
        } else {
            await next()
        }
    })

    app.use(mount("/api/v1", router.routes()))

}

ApiModule.stop = async () => {
    async function stopMongoose() {
        return new Promise((resolve) => {
            mongoose.connection.close(function () {
                console.log("Mongoose connection stopped")
                resolve()
            })
        })
    }

    await stopMongoose()
}

module.exports = ApiModule
