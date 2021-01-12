const app = require('./server.js');
const dbConnect = require('./db.js');

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