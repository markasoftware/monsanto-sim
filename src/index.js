//this is released under GPLv3 or something
var express = require('express');
var session = require('express-session');
var nedbStore = require('nedb-session-store')(session);
var bodyParser = require('body-parser');
var mustache = require('mustache');
var fs = require('fs');

//prepare the thingies
var monsantoView = {
    side: 'monsanto',
    specialimg: 'crop'
};
var oppositionView =  {
    side: 'opposition',
    specialimg: 'farmer'
};

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
    //generate the genes
    //STUFF HERE LATER

    fs.readFile('./play.html', 'utf8', (err, pf) => res.send(mustache.render(pf, view)).end() );
});



app.get('/get-rooms', function(req, res){
    res.send(games).end();
});


app.listen(1338);
