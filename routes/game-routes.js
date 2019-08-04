const router = require('express').Router();

router.get('/room/:id', (req, res) => {
    
    if(req.user){
        res.render('gameRoom', { user: req.user }); 
    }else{
        res.render('login', { user: req.user , erroMsg: null});
    }
    
});

router.get('/', (req, res) => {

    // if(req.user){
    //     res.render('gameRoom', { user: req.user }); 
    // }else{
    //     res.render('drawGame', { user: req.user });
    // }

    res.render('drawGame', { user: req.user });
});



module.exports = router;