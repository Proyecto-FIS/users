var express = require('express');
var bodyParser = require('body-parser');

const toasters = require('./routes/toasters');
const customers = require('./routes/customers');
const auth = require('./routes/auth');

var port = 3000;
var BASE_API_PATH = "/api/v1";


console.log("Starting API server...");

var app = express();
app.use(bodyParser.json());

//Swagger documentation
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
    files: ['./routes/**/*.js'] //Path to the API handle folder
};

expressSwagger(options);


//Routes
app.get("/", (req, res) => {
    res.send("<html><body><h1> User management index page. </h1></body> </html>");
});

app.use(BASE_API_PATH + '/customers', customers);
app.use(BASE_API_PATH + '/toasters', toasters);
app.use(BASE_API_PATH + '/auth', auth);

app.listen(port);