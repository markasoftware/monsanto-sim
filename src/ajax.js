var express = require('express');
var logic = require('./logic.js');
var data = require('./data.js');
var games = data.games, traits = data.traits;

var app = express.Router();

app.get('/ajax/start', (req, res, next) => {
    var sess = req.session;

    //the object we'll send to the client
    var toSend = {};
});

module.exports = app;
