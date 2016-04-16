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
        stuff.winner = stuff.winner ? 'You' : 'Opponent';
        if(typeof stuff.gg !== 'undefined'){
            stuff.gg = m ? stuff.gg : !stuff.gg;
            stuff.gg = stuff.gg ? 'You' : 'Opponent';
        }
        return stuff;
    }
    if(room.turnOver) {
        if(typeof room.turnEndSide !== 'undefined' && room.turnEndSide === sess.monsanto){
            res.send({doTurn: false}).end();
            return;
        }
        console.log(chalk.grey('other player already ended'));
        console.log(chalk.grey('room: ' + sess.room));
        console.log(chalk.grey('monsanto: ' + sess.monsanto));

        //ok, here's where the stuff will go
        
        informationStuff.doTurn = true;

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

        //GG
        [true, false].forEach((curSide) => {
            if(room[gs(curSide)].money <= 0){
                //if other person is also bankrupt
                if(room[gs(!curSide)].money <= 0)
                    informationStuff.gg = room.monsanto.money > room.opposition.money;
                else
                    informationStuff.gg = !curSide;
            }
        });

        room.turnOver(processStuff(informationStuff, !sess.monsanto));
        res.send(processStuff(informationStuff, sess.monsanto)).end();


        next();
    } else {
        console.log(chalk.grey('creating turnOver function'));
        console.log(chalk.grey('room: ' + sess.room));
        console.log(chalk.grey('monsanto: ' + sess.monsanto));
        room.turnEndSide = sess.monsanto;
        room.turnOver = function(stuff) {
            delete room.turnOver;
            delete room.turnEndSide;
            res.send(stuff).end();
            if (typeof stuff.gg !== 'undefined')
                delete games[sess.room];
            next();
        }
    }
});

app.post('/ajax/buy', function(req, res, next){
    console.log(chalk.yellow('/ajax/buy'));
    var sess = req.session;
    console.log(chalk.grey('room: ' + sess.room));
    console.log(chalk.grey('side: ' + sess.monsanto));
    var reqData = JSON.parse(req.body.json);
    var pawnPeople = games[sess.room][gs(sess.monsanto)].people[reqData.pawn];
    var buyingPerson = pawnPeople[reqData.boughtIndex].genes;
    var mainPawn = pawnPeople[0].genes;

    //MONEY
    var afterMoney = (games[sess.room][gs(sess.monsanto)].money -= pawnPeople[reqData.boughtIndex].price);

    //CROSSOVER
    var crossoverIndex = chance.integer({min: 0, max: traits[reqData.pawn].length - 1});
    var val1 = !!buyingPerson[crossoverIndex][0];
    var val2 = !!buyingPerson[crossoverIndex][1];
    buyingPerson[crossoverIndex][0] = val2;
    buyingPerson[crossoverIndex][1] = val1;

    //INDEPENDENT ASSORTMENT
    var numOfSectors = traits[reqData.pawn].length/2;
    function assort(genesToSort){
        var sectors = [];
        for(var k = 0; k < numOfSectors; ++k){
            var curBool = chance.bool();
            sectors.push(curBool, curBool);
        }
        var selectedAlleles = [];
        sectors.forEach(function(curSector, curIndex){
            selectedAlleles.push(genesToSort[curIndex][+curSector]);
        });
        return {
            sectors: sectors,
            selectedAlleles: selectedAlleles
        };
    }
    var assortedMain = assort(mainPawn);
    var assortedBuy = assort(buyingPerson);
    var newGenes = [];
    for(var l = 0; l < assortedMain.selectedAlleles.length; ++l){
        newGenes.push([ assortedMain.selectedAlleles[l], assortedBuy.selectedAlleles[l] ]);
    }
    
    //NEW PEOPLE
    var newGuys = [];
    var namePool = [];
    newGuys[0] = logic.genMate(traits[reqData.pawn], chance.bool(), namePool);
    newGuys[0].genes = newGenes;
    for(var k = 0; k < 3; ++k){
        newGuys.push(logic.genMate(traits[reqData.pawn], !newGuys[0].male, namePool));
    }
    pawnPeople.length = 0;
    Object.assign(pawnPeople, newGuys);

    res.send({
        money: afterMoney,
        crossover: crossoverIndex,
        assort: {
            main: assortedMain,
            buy: assortedBuy
        },
        newPeople: newGuys
    });
});

module.exports = app;
