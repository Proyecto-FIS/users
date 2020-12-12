// Express
var express = require('express');
var bodyParser = require('body-parser');

console.log("Starting API server...");

var app = express();
app.use(bodyParser.json());

module.exports = app;
