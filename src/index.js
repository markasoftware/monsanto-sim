//this is released under GPLv3 or something
var chalk = require('chalk');

console.log(chalk.green('loading modules...'));

var express = require('express');
var session = require('express-session');
var nedbStore = require('nedb-session-store')(session);
var bodyParser = require('body-parser');
var mustache = require('mustache');
var fs = require('fs');
var chance = new (require('chance'))();
var app = express();

var logic = require('./logic.js');
var data = require('./data.js');
var games = data.games, traits = data.traits, pawns = data.pawns, sides = data.sides;

console.log(chalk.green('modules loaded'));

//prepare the thingies
var monsantoView = {
    side: 'monsanto',
    specialImg: 'crop'
};
var oppositionView =  {
    side: 'opposition',
    specialImg: 'farmer'
};

app.use(express.static('public'));
app.use(session({
    store: new nedbStore({inMemoryOnly: true}),
    secret: process.env.SECRET || 'leopard octocat',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 24*60*60*1000}
}));
app.use(bodyParser.urlencoded({extended: true}));

app.use(require('./ajax.js'));

app.post('/init', function(req, res){
    console.log(chalk.yellow('user joining game /init'));
    var sess = req.session;
    var roomName = req.body.room;
    sess.room = roomName;

    console.log(chalk.grey('room: ' + roomName));

    var room = games[roomName];

    if(!room){
        console.log(chalk.grey('creating new room'));
        //monsanto or opposition?
        var isMonsanto = chance.bool();
        sess.monsanto = isMonsanto;

        console.log(chalk.grey('is ' + (isMonsanto ? '' : 'not') + ' monsanto'));

        room = { monsantoJoined: isMonsanto };

        res.sendFile('init.html',{root: __dirname});
    } else {
        console.log(chalk.grey('joining existing room'));

        sess.monsanto = !room.monsantoJoined;

        delete room.monsantoJoined;
        
        if(room.playerJoined) room.playerJoined();
        else {
            console.log(chalk.grey('no playerjoined function'));
            res.send('Please try a different room name, one that you have never used before').end();
            return;
        }

        //initialize stuff
        function genStartStuff(){
            var genes = {};
            pawns.forEach(function(curPawnKey){
                genes[curPawnKey] = [];
                var mainIsMale = chance.bool();
                for (var k = 0; k < 4; ++k) {
                    genes[curPawnKey].push(logic.genMate(traits[curPawnKey], (k === 0 ? mainIsMale : !mainIsMale)));
                }
            });
            return genes;
        }

        sides.forEach((curSide) => {
            room[curSide] = {money: 500, people: genStartStuff()};
        });

        var letters = chance.shuffle('abcdefghijklmnopqrstuvwxyz'.split(''));
        var letterIndex = 0;

        room.traits = {};
        pawns.forEach((curKey) => {
            room.traits[curKey] = [];
            traits[curKey].forEach((curTrait) => {
                room.traits[curKey].push({trait: curTrait, letter: letters[letterIndex++]});
            });
        });

        console.log(chalk.grey('everything generated'));

        res.redirect('play');
    }
    
    games[roomName] = room;
});

app.get('/wait-player-join', function(req, res){
    var sess = req.session;
    console.log(chalk.yellow('wait-player-join ajax'));
    console.log(chalk.grey('room: ' + sess.room));
    games[sess.room].playerJoined = function(){
        console.log(chalk.grey('other player joined for room ' + sess.room));
        delete games[sess.room].playerJoined;
        res.status(200).end();
    }
});

app.get('/play', function(req, res){
    console.log(chalk.yellow('user going to /play'));
    var sess = req.session;
    console.log(chalk.grey('room: ' + sess.room));
    console.log(chalk.grey('monsanto: ' + sess.monsanto));
    var view = sess.monsanto ? monsantoView : oppositionView;
    fs.readFile('./play.html', 'utf8', (err, pf) => res.send(mustache.render(pf, view)).end() );
});

app.get('/get-rooms', function(req, res){
    res.send(games).end();
});


app.listen(1338);
