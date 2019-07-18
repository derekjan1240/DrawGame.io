const passport = require('passport');
// Strategy
const LocalStrategy = require('passport-local').Strategy;
// Keys
const keys = require('./keys');
// DB Model
const User = require('../models/user-model');

/* serialize */
passport.serializeUser((user, done) => {
    done(null, user.id);
});
// cookie session id => req.user
passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

// LocalStrategy 
passport.use('register', 
    new LocalStrategy( 
        (username, password, done) => {
            console.log('new LocalStrategy register')
            User.findOne({email: username}).then((currentUser) => {
                if(currentUser){
                    // Account already exists
                    return done(null, false);
                }else{
                    new User({
                        username: username,
                        email: username,
                        password: password
                        // password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null), // encrypt 
                    }).save().then((newUser) => {
                        console.log('> created new user: ', newUser);
                        // Send varify email
                        // Mailer(newUser.email, newUser._id);
                        done(null, newUser);
                    });
                }
            });
        }
));
// Third-party Strategy 