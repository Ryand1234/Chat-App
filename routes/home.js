var router = require('express').Router()
var session = require('express-session')

router.get('/', (req, res, next)=>{

	if(res.session.user != undefined)
		res.render('chat.ejs')
	else
		res.render('login.ejs')
});

module.exports = router;
