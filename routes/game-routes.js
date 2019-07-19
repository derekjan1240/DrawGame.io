const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('drawGame', { user: req.user });
});

router.get('/create', (req, res) => {
    req.user?  res.render('gameRoom', { user: req.user }) : res.redirect('/login');
});

module.exports = router;