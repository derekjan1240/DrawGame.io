const express = require('express');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const passportSetup = require('./config/passport-setup');
const session     = require('express-session');
const keys = require('./config/keys');
const User = require('./models/user-model');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// set view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

// session 
app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        // secure: true,                    // https security
        maxAge: 1000 * 60 * 60 * 24
        // maxAge: 1000 * 60
    }
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// connect to mongodb
mongoose.connect(keys.mongodb.dbURI, { useNewUrlParser: true },() => {
    console.log('connected to mongodb');
});

// Routes
const authRoutes = require('./routes/auth-routes');
const gameRoutes = require('./routes/game-routes');
const dataRoutes = require('./routes/data-routes');
// Set up routes
app.use('/auth', authRoutes);
app.use('/game', gameRoutes);
app.use('/data', dataRoutes);

// create home route
app.get('/', (req, res) => {
    // res.sendFile(__dirname + '/index.html');
    res.render('home', { user: req.user });
});

app.get('/login', (req, res) => {
    res.render('login', { user: req.user });
});

app.get('/profile', (req, res) => {
    req.user?  res.render('profile', { user: req.user }) : res.redirect('/login');
});

// Creste Server
const server = app.listen(3000, ()=>{
    console.log('listening for requests on port 3000!');
});

// Create Socket
const io = socket(server);

io.on('connection', (socket)=> {
    console.log('made socket connection', socket.id);
    
    socket.on('showConnectedPeople',()=>{
        io.of('/').clients((error, clients) => {
            if (error) throw error;
            console.log(clients);                   // list of all client 
        });
    })

    socket.on('showRoomPeople',(data)=>{
        io.of('/').in(data.roomName).clients((error, clients) => {
            if (error) throw error;
            console.log(clients);                   // list of client in room 
        });
    })

    socket.on('passPicToServerP', (data)=>{
        // io.emit('getPic', {pic: data});
        socket.broadcast.emit('getPic', {pic: data});
    });

    socket.on('joinRoom', (data)=>{
        io.of('/').in(data.roomName).clients((error, clients) => {
            if (error) throw error;
            if(clients.length<2){
                socket.join(data.roomName);
                // opponentJoin
                if(data.roomName != data.user._id){
                    socket.in(data.roomName).broadcast.emit('opponentJoin', {opponentInfo: data.user});
                }
            }else{
                // The room is full
                socket.emit('RoomIsFull', { msg: 'The room is full!' });
            }
        });
    });

    socket.on('passHostInfoToOpponent',(data)=>{
        socket.in(data.roomName).broadcast.emit('hostInfoSet', {hostInfo: data.user});
    })

    socket.on('getReady',(data)=>{
        socket.in(data.roomName).broadcast.emit('opponentReady');
    })

    socket.on('offReady',(data)=>{
        socket.in(data.roomName).broadcast.emit('opponentOffReady');
    })

    socket.on('passPicToServer', (data)=>{
        socket.in(data.roomName).broadcast.emit('getPic', {pic: data.pic});
    });

    // socket.emit('request', /* */); // emit an event to the socket
    // io.emit('broadcast', /* */); // emit an event to all connected sockets
    // socket.on('reply', function(){ /* */ }); // listen to the event
    // socket.broadcast.emit('message', { /* */ }); // sending to all clients except sender
    // socket.to('room').emit('an event', { some: 'data' });
});


