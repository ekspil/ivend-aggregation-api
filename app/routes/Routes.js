const Router = require("koa-router")
const router = new Router()

/**
 *
 * @param injects {object}
 * @returns {Router}
 */
module.exports = function (injects) {
    const {aggregationController} = injects

    router.post("/register/controller", aggregationController.registerController);
    router.post("/register/error", aggregationController.registerError);
    router.post("/register/state", aggregationController.registerState);

    return router;
}
