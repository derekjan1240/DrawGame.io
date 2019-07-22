const router = require('express').Router();

const authCheck = (req, res, next) => {
    if(!req.user){
        res.redirect('/auth/login');
    } else {
        next();
        // if(!req.user.active){
        //     res.redirect('/profile');
        // } else {
        //    next();
        // }
    }
};

router.get('/user', authCheck, (req, res) => {
    res.json(req.user);
});




module.exports = router;