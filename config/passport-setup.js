const passport = require('passport');
const jwt = require('jsonwebtoken');
// Strategy
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LineStrategy = require('passport-line-auth').Strategy;
// Keys
const keys = require('./keys');
// DB Model
const User = require('../models/user-model');
// Bcrypt 
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
            User.findOne({email: username}).then((currentUser) => {
                if(currentUser){
                    // Account already exists
                    done(null, false, { message: '> Account already exists.' });
                }else{
                    new User({
                        username: username,
                        email: username,
                        password: bcrypt.hashSync(password, saltRounds)
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

passport.use('login', 
    new LocalStrategy( 
        (username, password, done) => {
            User.findOne({email: username}).then((dbUser) => {
                if(dbUser){
                    // Account already exists
                    if(bcrypt.compareSync(password, dbUser.password)){
                        done(null, dbUser);
                    }else{
                        console.log(dbUser.password, bcrypt.hashSync(password, saltRounds))
                        done(null, false, { message: '> Password Wrong!.' }); 
                    }
                }else{
                    done(null, false, { message: '> Can not find the username!.' });
                }
            });
        }
));
// Third-party Strategy 
// GoogleStrategy --------------------------------
passport.use(

    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        // callbackURL: keys.ngrokUrl.webUrl + '/auth/google/redirect'   //when use ngrok
        callbackURL: 'http://127.0.0.1:3000/auth/google/redirect'     //when use local

    }, (accessToken, refreshToken, profile, done) => {
        // check if user already exists in our own db
        // console.log('profile: ',profile._json);

        User.findOne({email: profile._json.email}).then((currentUser) => {
            if(currentUser){
                // Account already exists
                if(!currentUser.username){
                    currentUser.username = profile._json.name;
                }
                currentUser.googleId =  profile.id;
                currentUser.thumbnail =  profile._json.picture;
                currentUser.active = true;

                currentUser.save().then((currentUser) => {
                    console.log('> User login: ', currentUser);
                    done(null, currentUser);
                });

            }else {
                // Not exists, create user
                new User({
                    username: profile._json.name,
                    email: profile._json.email,
                    password: '0000',  //temp psw
                    active: true,
                    googleId: profile.id,
                    thumbnail: profile._json.picture
                }).save().then((newUser) => {
                    console.log('> Created new user: ', newUser);
                    done(null, newUser);
                });
            }
        });
    })
);

// LineStrategy --------------------------------
passport.use('line',

    new LineStrategy(
        {
            channelID: keys.line.channelID,
            channelSecret: keys.line.channelSecret,
            // callbackURL: keys.ngrokUrl.webUrl + '/auth/line/redirect',   //when use ngrok
            callbackURL: 'http://127.0.0.1:3000/auth/line/redirect',        //when use local
            scope: ['profile', 'openid', 'email']
            // botPrompt: 'normal'
        },
        (accessToken, refreshToken, params, profile, done) => {
            let profileDecode = jwt.decode(params.id_token);
            // console.log(profileDecode);
            if(!profileDecode.email){
                // User not authorized email
                done(null, false, { message: '> Please authorized the email!.' });
            }else{

                User.findOne({email: profileDecode.email}).then((currentUser) => {
                    if(currentUser){
                        // Account already exists
                        currentUser.username? null : currentUser.username = profileDecode.name;
                        currentUser.lineId =  profileDecode.sub;
                        currentUser.thumbnail =  profileDecode.picture;
                        currentUser.active = true;
    
                        currentUser.save().then((currentUser) => {
                            console.log('> user is: ', currentUser);
                            done(null, currentUser);
                        });
    
                    }else{
                        // Not exists, create user
                        new User({
                            username: profileDecode.name,
                            email: profileDecode.email,
                            password: '0000', //temp
                            active:true,
                            lineId: profileDecode.sub,
                            thumbnail: profileDecode.picture
                            
                        }).save().then((newUser) => {
                            console.log('> created new user: ', newUser);
                            done(null, newUser);
                        });
                    }
                });
            }
        }
));