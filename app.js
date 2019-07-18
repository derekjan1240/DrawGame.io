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
        // maxAge: 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60
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
// Set up routes
app.use('/auth', authRoutes);
// app.use('/profile', profileRoutes);
// app.use('/post', postRoutes);
// app.use('/user', userRoutes);
// app.use('/video', videosRoutes);
// app.use('/course', courseRoutes);

// create home route
app.get('/', (req, res) => {
    // res.sendFile(__dirname + '/index.html');
    console.log(req.user)
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/game', (req, res) => {
    res.render('drawGame');
});

app.get('/profile', (req, res) => {
    res.render('profile');
});

// Creste Server
const server = app.listen(3000, ()=>{
    console.log('listening for requests on port 3000!');
});

// Create Socket
const io = socket(server);

io.on('connection', (socket)=> {
    console.log('made socket connection', socket.id);

    socket.on('passPicToServer', (data)=>{
        // io.emit('getPic', {pic: data});
        socket.broadcast.emit('getPic', {pic: data});
    });

    // socket.emit('request', /* */); // emit an event to the socket
    // io.emit('broadcast', /* */); // emit an event to all connected sockets
    // socket.on('reply', function(){ /* */ }); // listen to the event
    // socket.broadcast.emit('message', { /* */ }); // sending to all clients except sender
});


