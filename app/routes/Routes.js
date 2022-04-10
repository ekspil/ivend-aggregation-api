const Router = require("koa-router")
const router = new Router()

/**
 *
 * @param injects {object}
 * @returns {Router}
 */
module.exports = function (injects) {
    const {aggregationController, telemetronController} = injects

    router.post("/register/controller", aggregationController.registerController)
    router.post("/register/error", aggregationController.registerError)
    router.post("/register/state", aggregationController.registerState)
    router.post("/register/sale", aggregationController.registerSale)
    router.post("/register/event", aggregationController.registerEvent)

    router.post("/register/telemetron", telemetronController.registerEvent)
    router.post("/register/telemetron/external", telemetronController.registerEventExternal)

    router.get("/status", (ctx) => {
        ctx.status = 200
        ctx.body = {health: "OK"}
    })

    return router
}
