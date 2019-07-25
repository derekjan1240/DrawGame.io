const router = require('express').Router();
const passport = require('passport');
// DB Model
const User = require('../models/user-model');
// Bcrypt 
const bcrypt = require('bcrypt');
const saltRounds = 10;

// auth logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// auth login
/* Register */
router.post('/register',(req, res, next)=>{
    passport.authenticate('register', (err, user, options) => {
        if (err) { return next(err); }
        if (!user) { 
            console.log(options) 
            return res.render('login', { user: null, erroMsg: options.message});
        }
        req.logIn(user, (err) =>{
            if (err) { return next(err); }
            return res.redirect('/profile');
        });
    })(req, res, next);
});

/* Modify */
router.post('/modify',(req, res)=>{
    if(!req.user){
        res.redirect('/login');
    }else{
        if(req.body.newPassword != req.body.newPasswordcheck){
            res.redirect('/profile');
        }else{
            if(req.body.newPassword){
                // modify password
                User.findOne({email: req.user.email}).then((currentUser)=>{
                    if(bcrypt.compareSync(req.body.oldPassword, currentUser.password)){
                        currentUser.password = bcrypt.hashSync(req.body.newPassword, saltRounds);
                        currentUser.save().then((updateUser) => {
                            console.log('> update user(password): ', updateUser);
                            res.redirect('/profile');
                        });
                    }
                })
            }
            if(req.body.username){
                // modify username
                User.findOneAndUpdate(
                    { email: req.user.email}, { username: req.body.username }, {new: true}, (err, updatateUser)=> {
                        if(err) {console.log(err)}
                        console.log('> update user(username): ', updatateUser);
                        res.redirect('/profile');
                });
            }
        }
    }
    
});

/* Login */
// local 
router.post('/login', (req, res, next)=>{
    passport.authenticate('login', (err, user, options) => {
        if (err) { return next(err); }
        if (!user) { 
            console.log(options) 
            return res.render('login', { user: null, erroMsg: '> Account or Password incorrect!'});
        }
        req.logIn(user, (err) =>{
            if (err) { return next(err); }
            return res.redirect('/profile');
        });
    })(req, res, next);
});

// oauth 2.0 
router.get('/google', passport.authenticate('google', {
    scope: ['profile','email']
}));

router.get('/line', passport.authenticate('line', {
    scope: ['profile', 'openid', 'email']
}));

// callback route for google to redirect to
router.get('/google/redirect', (req, res, next)=>{
    passport.authenticate('google', (err, user, options) => {
        if (err) { return next(err); }
        if (!user) { 
            console.log(options); 
            return res.render('login', { user: null, erroMsg: options.message});
        }
        req.logIn(user, (err) =>{
            if (err) { return next(err); }
            return res.redirect('/profile');
        });
    })(req, res, next);
});

router.get('/line/redirect', (req, res, next)=>{
    passport.authenticate('line', (err, user, options) => {
        if (err) { return next(err); }
        if (!user) { 
            console.log(options);
            return res.render('login', { user: null, erroMsg: options.message});
        }
        req.logIn(user, (err) =>{
            if (err) { return next(err); }
            return res.redirect('/profile');
        });
    })(req, res, next);
});

    // res.render('home', { user: req.user });
    //user password cheak
    // if(bcrypt.compareSync('0000', req.user.password)){
    //   res.render('profile', { user: req.user, Msg:'profile', ErroMsg:'預設密碼為 0000 請自行更改'});
    // }else{
    //   res.render('profile', { user: req.user, Msg:'profile', ErroMsg:''});
    // }

module.exports = router;