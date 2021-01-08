// Express
var express = require('express');
var bodyParser = require('body-parser');
const toasters = require('./routes/toasters');
const customers = require('./routes/customers');
const auth = require('./routes/auth');
var BASE_API_PATH = "/api/v1";

console.log("Starting API server...");

var app = express();
app.use(bodyParser.json());

//Routes
app.get("/", (req, res) => {
    res.send("<html><body><h1> User management index page. </h1></body> </html>");
});

app.use(BASE_API_PATH + '/customers', customers);
app.use(BASE_API_PATH + '/toasters', toasters);
app.use(BASE_API_PATH + '/auth', auth);

module.exports = app;
