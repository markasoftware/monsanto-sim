var express = require('express');
var logic = require('./logic.js');
var data = require('./data.js');
var games = data.games, traits = data.traits;

var app = express.Router();

app.get('/ajax/start', (req, res, next) => {
    var sess = req.session;
    var room = games[sess.room];

    //the object we'll send to the client
    toSend = room[sess.monsanto ? 'monsanto' : 'opposition'];
    toSend.traits = room.traits;

    res.send(toSend).end();
});

module.exports = app;
