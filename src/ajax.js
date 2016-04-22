var chalk = require('chalk');
var chance = new (require('chance'))();
var express = require('express');
var logic = require('./logic.js');
var gs = logic.gs;
var data = require('./data.js');
var games = data.games, traits = data.traits, pawns = data.pawns, sides = data.sides;

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
        stuff.lawyerMoney = stuff.winner ? room[gs(m)].money : (room[gs(m)].money -= stuff.lawyerDmg);
        stuff.soldierDamage = informationStuff.soldierAttack[gs(!m)];
        stuff.soldierAttack = informationStuff.soldierAttack[gs(m)];
        stuff.critSoldier = [ m ? stuff.critSoldier.monsanto : stuff.critSoldier.opposition, m ? stuff.critSoldier.opposition : stuff.critSoldier.monsanto ];
        stuff.soldierMoney = (room[gs(m)].money -= stuff.soldierDamage);
        stuff.profit = stuff.profit[gs(m)];
        stuff.critProfit = stuff.critProfit[gs(m)];
        stuff.finalMoney = (room[gs(m)].money += stuff.profit);
        stuff.winner = stuff.winner ? 'You' : 'Opponent';
        stuff.newMates = room[gs(m)].people;
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

        ////BEFORE VARIABLE DECLARATIONS////
        //LAWYER
        informationStuff.monsantoOdds = 50;
        var lawyerBaseDmg = 200;
        var lawyerDmgVariation = 35;
        var lawyerDmg = {};
        //SCIENTIST
        var numOfMates = {
            monsanto: 1,
            opposition: 1
        };
        //SOLDIER
        informationStuff.critSoldier = {};
        informationStuff.soldierAttack = {};
        var soldierBaseDmg = 175;
        var soldierDmgVariation = 35;
        //PROFIT
        var baseProfit = 450;
        var profitVariation = 50;
        informationStuff.critProfit = {};
        informationStuff.profit = {};

        ////TRAIT PROCESSING////
        sides.forEach(function(curSide){
            console.log(chalk.blue.bold(curSide));

            //LAWYER
            console.log(chalk.blue('processing lawyer'));

            var lawyerGenes = room[curSide].people.lawyer[0].genes;

            //odds first
            console.log(chalk.grey('start odds: ' + informationStuff.monsantoOdds));
            //sm odds boost
            if(logic.hasTrait(lawyerGenes[0], true))
                adjustOdds(10);
            //lg odds boost
            if(logic.hasTrait(lawyerGenes[1], false))
                adjustOdds(20);
            console.log(chalk.grey('end odds: ' + informationStuff.monsantoOdds));

            function adjustOdds(amount){
                informationStuff.monsantoOdds +=
                    curSide === 'monsanto' ?
                        amount : -amount;
            }

            //damage second
            lawyerDmg[curSide] = logic.genericDmgProcessor(
                lawyerBaseDmg,
                lawyerDmgVariation,
                false,
                [{
                    type: 'standard',
                    hasTrait: logic.hasTrait(lawyerGenes[2], true),
                    boost: 0.2
                },
                {
                    type: 'standard',
                    hasTrait: logic.hasTrait(lawyerGenes[3], false),
                    boost: 0.4
            }]).dmg;

            //SOLDIER
            console.log(chalk.blue('processing soldier'));
            var soldierGenes = room[curSide].people.soldier[0].genes;

            var soldierDmg = logic.genericDmgProcessor(
                soldierBaseDmg,
                soldierDmgVariation,
                {
                    chance: 5,
                    dmg: 2.5
                },
                [{
                    type: 'standard',
                    hasTrait: logic.hasTrait(soldierGenes[0], true),
                    boost: 0.2
                },
                {
                    type: 'standard',
                    hasTrait: logic.hasTrait(soldierGenes[1], false),
                    boost: 0.4
                },
                {
                    type: 'critChance',
                    hasTrait: logic.hasTrait(soldierGenes[2], false),
                    boost: 10
                },
                {
                    type: 'critDmg',
                    hasTrait: logic.hasTrait(soldierGenes[3], false),
                    boost: 1.5
                }]);
            informationStuff.soldierAttack[curSide] = soldierDmg.dmg;
            informationStuff.critSoldier[curSide] = soldierDmg.crit;

            //PROFIT
            console.log(chalk.blue('processing profit'));
            var profitMultiplier = 1;
            var profitGenes = room[curSide].people.special[0].genes;
            var profitDmg = logic.genericDmgProcessor(
                    baseProfit,
                    profitVariation,
                    {
                        chance: 5,
                        dmg: 2.5
                    },
                    [{
                        type: 'standard',
                        hasTrait: logic.hasTrait(profitGenes[0], true),
                        boost: 0.2
                    },
                    {
                        type: 'standard',
                        hasTrait: logic.hasTrait(profitGenes[1], false),
                        boost: 0.4
                    },
                    {
                        type: 'critChance',
                        hasTrait: logic.hasTrait(profitGenes[2], false),
                        boost: 10
                    },
                    {
                        type: 'critDmg',
                        hasTrait: logic.hasTrait(profitGenes[3], false),
                        boost: 1.5
                    }]);
            informationStuff.profit[curSide] = profitDmg.dmg;
            informationStuff.critProfit[curSide] = profitDmg.crit;

            //NEW MATES/SCIENTIST
            pawns.forEach(function(curPawn){
                var namePool = [];
                var curArr = room[curSide].people[curPawn];
                curArr.length = 1;
                var newArrThingy = logic.genMultipleMates(room[curSide].people.scientist[0].genes, traits[curPawn], !curArr[0].male, namePool);
                newArrThingy.forEach((idk) => curArr.push(idk));
            });
        });

        ////FINAL STUFF PROCESSING////
        
        //LAWYER
        console.log(chalk.blue('final lawyer processing'));
        console.log(chalk.grey('monsanto odds: ' + informationStuff.monsantoOdds));
        informationStuff.winner = chance.bool({likelihood: informationStuff.monsantoOdds});
        console.log(chalk.grey('winner: ' + informationStuff.winner));
        informationStuff.lawyerDmg = lawyerDmg[gs(informationStuff.winner)];
        console.log(chalk.grey('damage: ' + informationStuff.lawyerDmg));

        //GG
        //not in main part because it needs bools and needs to do drawbreaking
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
    var allThePeople = games[sess.room][gs(sess.monsanto)].people;
    var pawnPeople = allThePeople[reqData.pawn];
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
    newGuys = newGuys.concat(logic.genMultipleMates(allThePeople.scientist[0].genes, traits[reqData.pawn], !newGuys[0].male, namePool));
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
