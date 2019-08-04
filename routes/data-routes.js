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
    const data = {
        _id : req.user._id,
        username: req.user.username,
        thumbnail: req.user.thumbnail
    }
    res.json(data);
});

module.exports = router;