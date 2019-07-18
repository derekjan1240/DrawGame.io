const router = require('express').Router();
const passport = require('passport');
// const bcrypt = require('bcrypt-nodejs');

// auth login
/* Register */
router.post('/login', 
    passport.authenticate('signin', { 
  		successRedirect : '/profile',
   		failureRedirect: '/login' 
	})
);

router.post('/register', 
    passport.authenticate('register', { 
  		successRedirect : '/profile',
   		failureRedirect: '/login' 
	})
);
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