var router = require('express').Router()
var mongo = require('mongodb');


router.get('/', (req, res, next)=>{

	res.render('login.ejs');
});


router.post('/', (req, res, next)=>{

	mongo.MongoClient.connect('mongodb://localhost:5000', (err, client)=>{
	
		if(err)
			res.status(200).json({"msg" : "Error"});
		else{

			var db = client.db('chat');
			db.collection('user').findOne({email : req.body.email, passwd : req.body.passwd}, (error, user)=>{
			
				if (user != null){
					console.log("USE: ",user);
					req.session.user = user.name;
					res.redirect('/home');
				}else
					res.send("<h1> Incorrect Email/Passwd</h1?");
			
			});
		}
	});
});

module.exports = router;
