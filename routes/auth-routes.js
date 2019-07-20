const router = require('express').Router();
const passport = require('passport');
// const bcrypt = require('bcrypt-nodejs');

// auth logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// auth login
/* Register */
router.post('/login', (req, res, next)=>{
    passport.authenticate('login', (err, user, options) => {
        if (err) { return next(err); }
        if (!user) { 
            console.log(options) 
            return res.redirect('/login'); 
        }
        req.logIn(user, (err) =>{
            if (err) { return next(err); }
            return res.redirect('/profile');
        });
    })(req, res, next);
});

router.post('/register',(req, res, next)=>{
    passport.authenticate('register', (err, user, options) => {
        if (err) { return next(err); }
        if (!user) { 
            console.log(options) 
            return res.redirect('/login'); 
        }
        req.logIn(user, (err) =>{
            if (err) { return next(err); }
            return res.redirect('/profile');
        });
    })(req, res, next);
});

/* Login */
// local 
// oauth 2.0 
router.get('/google', (req, res) => {
    res.render('home');
});

router.get('/line', (req, res) => {
    res.render('home');
});

module.exports = router;