//this is released under GPLv3 or something
var express = require('express');
var session = require('express-session');
var nedbStore = require('nedb-session-store')(session);
var bodyParser = require('body-parser');
var mustache = require('mustache');
var fs = require('fs');
var chance = new (require('chance'))();
var app = express();

var logic = require('./logic.js');

//prepare the thingies
var monsantoView = {
    side: 'monsanto',
    specialImg: 'crop'
};
var oppositionView =  {
    side: 'opposition',
    specialImg: 'farmer'
};

var games = {};

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
    var sess = req.session;
    var roomName = req.body.room;
    sess.room = roomName;

    var room = games[roomName];

    if(!room){
        //monsanto or opposition?
        var isMonsanto = chance.bool();
        sess.monsanto = isMonsanto;
        room = { monsantoJoined: isMonsanto };

        res.sendFile('init.html',{root: __dirname});
    } else {
        sess.monsanto = !room.monsantoJoined;

        delete room.monsantoJoined;
        
        room.playerJoined();

        //initialize stuff
        function genStartStuff(){
            function genPawnTemplate() {
                return {main: [], mates: []};
            }
            var genes = {
                lawyer: genPawnTemplate(),
                scientist: genPawnTemplate(),
                soldier: genPawnTemplate(),
                special: genPawnTemplate()
            };
            Object.keys(genes).forEach(function(curPawnKey){
                genes[curPawnKey].main = (logic.genMate(logic.traits[curPawnKey]));
                for (var k = 0; k < 3; ++k) {
                    genes[curPawnKey].mates.push(logic.genMate(logic.traits[curPawnKey]));
                }
            });
            return genes;
        }

        room.monsanto = genStartStuff();
        room.opposition = genStartStuff()

        res.redirect('play');
    }
    
    games[roomName] = room;
});

app.get('/wait-player-join', function(req, res){
    var sess = req.session;
    games[sess.room].playerJoined = function(){
        delete games[sess.room].playerJoined;
        res.status(200).end();
    }
});

app.get('/play', function(req, res){
    var sess = req.session;
    var view = sess.monsanto ? monsantoView : oppositionView;
    fs.readFile('./play.html', 'utf8', (err, pf) => res.send(mustache.render(pf, view)).end() );
});

app.get('/get-rooms', function(req, res){
    res.send(games).end();
});


app.listen(1338);
