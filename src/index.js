//this is released under GPLv3 or something
var express = require('express');
var session = require('express-session');
var nedbStore = require('nedb-session-store')(session);
var bodyParser = require('body-parser');
var mustache = require('mustache');
var fs = require('fs');
var app = express();
require('express-ws')(app);

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

app.post('/init', function(req, res){
    var sess = req.session;
    var roomName = req.body.room;
    sess.room = roomName;

    var room = games[roomName];

    if(!room){
        //monsanto or opposition?
        var isMonsanto = !!Math.round(Math.random());
        sess.monsanto = isMonsanto;
        room = {
            monsantoJoined: !isMonsanto
        };

        res.sendFile('init.html',{root: __dirname});
    } else {
        if(room.monsantoJoined){
            sess.monsanto = false;
        } else {
            sess.monsanto = true;
        }

        delete room.monsantoJoined;
        
        room.playerJoined();

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
