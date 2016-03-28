var express = require('express');
var session = require('express-session');
var nedbStore = require('nedb-session-store')(session);
var bodyParser = require('body-parser');
var mustache = require('mustache');
var fs = require('fs');

//prepare the thingies
var playFile = fs.readFileSync('./play.html', 'utf8');
var playFileMonsanto = mustache.render(playFile, {
    side: 'monsanto'
});
var playFileOpposition = mustache.render(playFile, {
    side: 'opposition'
});

var games = {};

var app = express();

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
            monsanto: isMonsanto?sess.id:null,
            opposition: isMonsanto?null:sess.id
        };

        res.sendFile('init.html',{root: __dirname});
    } else {
        if(room.monsanto){
            room.opposition = sess.id;
            sess.monsanto = false;
        } else {
            room.monsanto = sess.id;
            sess.monsanto = true;
        }
        
        room.playerJoined();

        res.redirect('/play');
    }
    
    games[roomName] = room;
});

app.get('/wait-player-join', function(req, res){
    var sess = req.session;
    games[sess.room].playerJoined = function(){
        delete games[sess.room].playerJoined;
        res.send('yay');
    }
});

app.get('/play', function(req, res){
    var sess = req.session;
    res.send(sess.monsanto?playFileMonsanto:playFileOpposition);
});



app.get('/get-rooms', function(req, res){
    res.send(JSON.stringify(games));
});


app.listen(1338);
