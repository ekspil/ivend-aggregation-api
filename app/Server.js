const App = require("./App")

const server = {

    start: async () => {
        await App.start()
        App.listen(80)
    },

    stop: async () => {
        await App.stop()
    }

}

module.exports = server
