var express = require('express');
var bodyParser = require('body-parser');

const DatabaseConnection = require("./db");
const AuthRoute = require('./routes/Auth');
const CustomerRoute = require("./routes/Customer");
const ToasterRoute = require("./routes/Toaster");
const CircuitBreaker = require("./circuitBreaker");

console.log("Starting API server...");
class App {
    constructor() {
        this.app = express();
        this.router = express.Router();
        this.server = null;
        this.port = process.env.PORT || 3000;
        this.db = new DatabaseConnection();
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        this.app.use(this.router);

        // Route Registration
        const BASE_API_PATH = "/api/v1";
        this.CustomerRoute = new CustomerRoute(BASE_API_PATH, this.router);
        this.ToasterRoute = new ToasterRoute(BASE_API_PATH, this.router);
        this.AuthRoute = new AuthRoute(BASE_API_PATH, this.router);

        // CircuitBreaker
        CircuitBreaker.initHystrixStream(this.app);
        CircuitBreaker.initHystrixDashboard(this.app);

        // Swagger documentation
        const expressSwagger = require('express-swagger-generator')(this.app);
        let options = {
            swaggerDefinition: {
                info: {
                    description: 'User management server',
                    title: 'Swagger',
                    version: '1.0.0',
                },
                host: 'localhost:'+this.port,
                basePath: BASE_API_PATH,
                produces: [
                    "application/json",
                    "application/xml"
                ],
                schemes: ['http', 'https'],
                securityDefinitions: {
                    JWT: {
                        type: 'apiKey',
                        in: 'header',
                        name: 'Authorization',
                        description: "",
                    }
                }
            },
            basedir: __dirname, //app absolute path
            files: ['./routes/*.js'] //Path to the API handle folder
        };
        expressSwagger(options);

        this.app.use(App.errorHandler);
    }

    static errorHandler(err, req, res, next) {
        res.status(500).json({ msg: err });
    }

    run() {
        return new Promise((resolve, reject) => {

            process.on("SIGINT", () => {
                console.log("[SERVER] Shut down requested by user");
                this.stop().then(() => { });
            });

            this.db.setup()
                .then(() => {
                    this.server = this.app.listen(this.port, () => {
                        console.log(`[SERVER] Running at port ${this.port}`);
                        resolve();
                    });
                })
                .catch(reject);
        });
    }

    stop() {
        return new Promise((resolve, reject) => {

            if (this.server == null) {
                reject();
                return;
            }

            this.server.close(err => {
                if(err) {
                    reject(err);
                } else {
                    console.log("[SERVER] Closed successfully");
                    this.db.close().then(resolve).catch(reject);
                }
            });
        });
    }
}

module.exports = App;