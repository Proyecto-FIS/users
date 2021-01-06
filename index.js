var express = require('express');
var bodyParser = require('body-parser');
const router = express.Router();
const circuitBreaker = require("./circuitBreaker");
const dashboard = require('hystrix-dashboard')

const app = require('./server.js');
const dbConnect = require('./db.js');

const toasters = require('./routes/toasters');
const customers = require('./routes/customers');
const auth = require('./routes/auth');

var port = process.env.PORT || 3000;
var BASE_API_PATH = "/api/v1";

dbConnect().then(
    () => {
        app.listen(port);
        console.log("Server ready!")
    },
    err => {
        console.log("Connection error: "+err);
    }
)

app.use(router);
app.use(BASE_API_PATH + '/customers', customers);
app.use(BASE_API_PATH + '/toasters', toasters);
app.use(BASE_API_PATH + '/auth', auth);

app.use(
    dashboard({
        idleTimeout: 4000,
        interval: 2000,
        proxy: true,
    })
);
circuitBreaker.initHystrixStream(router);



// Swagger documentation //
const expressSwagger = require('express-swagger-generator')(app);

let options = {
    swaggerDefinition: {
        info: {
            description: 'User management server',
            title: 'Swagger',
            version: '1.0.0',
        },
        host: 'localhost:'+port,
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