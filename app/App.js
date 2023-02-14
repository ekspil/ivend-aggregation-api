const ApiModule = {}

const Koa = require("koa")
const mount = require("koa-mount")
const bodyParser = require("koa-bodyparser")
const Routes = require("./routes/Routes")
const AggregationController = require("./controllers/AggregationController")
const TelemetronController = require("./controllers/TelemetronController")
const CubeController = require("./controllers/CubeController")


const app = new Koa()

ApiModule.listen = (port) => {
    app.listen(port, "0.0.0.0")
        .on("error", (err) => console.error(err))
}

ApiModule.getCallback = () => {
    return app.callback()
}

ApiModule.start = async () => {
    if(!process.env.GRAPHQL_API_URL) {
        throw new Error("Set up GRAPHQL_API_URL environment first")
    }

    app.use(bodyParser())

    const aggregationController = new AggregationController()
    const telemetronController = new TelemetronController()
    const cubeController = new CubeController()
    const router = Routes({aggregationController, telemetronController, cubeController})

    app.use(async (ctx, next) => {
        if (ctx.request.method === "GET") {
            return await next()
        }

        const contentType = ctx.req.headers["content-type"] || ""

        if (ctx.request.method !== "GET" && !(contentType.includes("application/json") || contentType.includes("application/x-www-form-urlencoded") )) {
            ctx.status = 400
            ctx.body = {code: 1, message: "Invalid Content-Type header. Only application/json or application/x-www-form-urlencoded is accepted"}
        } else {
            await next()
        }
    })

    app.use(mount("/api/v1", router.routes()))

}

ApiModule.stop = async () => {
}

module.exports = ApiModule
