const App = require("../server");

module.exports = async () => {
    require("dotenv").config({ path: __dirname + "/../.env" });

    console.log();
    global.server = new App();
    await global.server.run();
};