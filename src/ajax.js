var express = require('express');
var logic = require('./logic.js');

var app = express.Router();

app.get('/ajax/start', (req, res, next) => {
    console.log(req.session);
});

module.exports = app;
