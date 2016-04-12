var chalk = require('chalk');
var chance = new (require('chance'))();
var express = require('express');
var logic = require('./logic.js');
var gs = logic.gs;
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
    function processStuff(stuff, m) {
        console.log(chalk.grey('proccesing stuff for monsanto: ' + m));
        stuff = JSON.parse(JSON.stringify(stuff));
        stuff.yourOdds = m ? stuff.monsantoOdds : (100 - stuff.monsantoOdds);
        stuff.theirOdds = m ? (100 - stuff.monsantoOdds) : stuff.monsantoOdds;
        stuff.winner = m ? stuff.winner : !stuff.winner;
        stuff.lawyerMoney = stuff.winner ? room[gs(m)].money : (room[gs(m)].money -= stuff.lawyerDamages);
        stuff.soldierDamage = informationStuff.soldierAttack[gs(!m)];
        stuff.soldierAttack = informationStuff.soldierAttack[gs(m)];
        stuff.soldierMoney = (room[gs(m)].money -= stuff.soldierDamage);
        stuff.profit = stuff.profit[gs(m)];
        stuff.finalMoney = (room[gs(m)].money += stuff.profit);
        stuff.winner = stuff.winner ? 'You' : 'Them';
        return stuff;
    }
    if(room.turnOver) {
        console.log(chalk.grey('other player already ended'));
        console.log(chalk.grey('room: ' + sess.room));
        console.log(chalk.grey('monsanto: ' + sess.monsanto));

        //ok, here's where the stuff will go

        //LAWYER
        informationStuff.monsantoOdds = 50;
        informationStuff.winner = chance.bool({likeliness: informationStuff.monsantoOdds});

        console.log(chalk.grey('winner: ' + informationStuff.winner));

        informationStuff.lawyerDamages = chance.natural({min: 100, max: 250});

        //SOLDIER
        informationStuff.soldierAttack = {};
        [true, false].forEach((curSide) => {
            var baseDmg = 200;
            //do stuff here
            informationStuff.soldierAttack[gs(curSide)] = chance.natural({min: baseDmg - 30, max: baseDmg + 30});
        });

        //PROFIT
        informationStuff.profit = {};
        [true, false].forEach((curSide) => {
            var baseProfit = 400;
            //do stuff here
            informationStuff.profit[gs(curSide)] = chance.natural({min: baseProfit - 50, max: baseProfit + 50});
        });
        room.turnOver(processStuff(informationStuff, !sess.monsanto));
        res.send(processStuff(informationStuff, sess.monsanto)).end();

        next();
    } else {
        console.log(chalk.grey('creating turnOver function'));
        console.log(chalk.grey('room: ' + sess.room));
        console.log(chalk.grey('monsanto: ' + sess.monsanto));
        room.turnOver = function(stuff) {
            delete room.turnOver;
            res.send(stuff).end();
            next();
        }
    }
});

module.exports = app;
