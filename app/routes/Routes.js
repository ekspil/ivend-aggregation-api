const Router = require("koa-router")
const router = new Router()

/**
 *
 * @param injects {object}
 * @returns {Router}
 */
module.exports = function (injects) {
    const {aggregationController} = injects

    router.post("/registerController", aggregationController.registerController);

    return router;
}
