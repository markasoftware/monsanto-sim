var chalk = require('chalk');
var chance = new (require('chance'))();
var express = require('express');
var logic = require('./logic.js');
var data = require('./data.js');
var games = data.games, traits = data.traits;

var app = express.Router();

app.get('/ajax/start', (req, res, next) => {
    var sess = req.session;
    console.log(chalk.yellow('starting ajax request'));
    console.log(chalk.grey('room: ' + sess.room));
    console.log(chalk.grey('monsanto: ' + sess.monsanto));
    var room = games[sess.room];

    //the object we'll send to the client
    toSend = room[sess.monsanto ? 'monsanto' : 'opposition'];
    toSend.traits = room.traits;

    res.send(toSend).end();

    next();
});

app.get('/ajax/turn', (req, res, next) => {
    console.log(chalk.yellow('ajax turn end'));
    var sess = req.session;
    console.log(chalk.grey('room: ' + sess.room));
    console.log(chalk.grey('monsanto: ' + sess.monsanto));
    var room = games[sess.room];
    var informationStuff = {};
    function processStuff(stuff) {
        stuff = JSON.parse(JSON.stringify(stuff));
        stuff.yourOdds = sess.monsanto ? stuff.monsantoOdds : (100 - stuff.monsantoOdds);
        stuff.theirOdds = sess.monsanto ? (100 - stuff.monsantoOdds) : stuff.monsantoOdds;
        stuff.winner = sess.monsanto ? stuff.winner : !stuff.winner;
        stuff.winner = stuff.winner ? 'You' : 'Them';
        return stuff;
    }
    if(room.turnOver) {
        console.log(chalk.grey('other player already ended'));

        //ok, here's where the stuff will go

        informationStuff.monsantoOdds = 50;

        informationStuff.winner = chance.bool({likeliness: informationStuff.monsantoOdds});

        room.turnOver(processStuff(informationStuff));

        res.send(processStuff(informationStuff)).end();
    } else {
        room.turnOver = function(stuff) {
            res.send(stuff).end();
            next();
        }
    }
});

module.exports = app;
