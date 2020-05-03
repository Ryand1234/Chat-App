var router = require('express').Router()
var mongo = require('mongodb')


router.get('/', (req, res, next)=>{

	res.render('register.ejs');
});


router.post('/', (req, res, next)=>{

	var data = {
		email : req.body.email,
		passwd : req.body.passwd,
		name : req.body.name
	};

	mongo.MongoClient.connect('mongodb://localhost:5000', (err, client)=>{
	
		if(err)
			res.status(200).json({"msg" : "Error"});
		else{

			var db = client.db('chat');
			db.collection('user').insertOne(data, (error, user)=>{
			
				res.render('login.ejs');
			
			});
		}
	});
});

module.exports = router;
