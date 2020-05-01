var router = require('express').Router()


router.get('/', (req, res, next)=>{

	var data = {
		email : req.body.email,
		passwd : req.body.passwd
	};

	mongo.MongoClient.connect('mongodb://localhost:5000', (err, client)=>{
	
		if(err)
			res.status(200).json({"msg" : "Error"});
		else{

			var db = client.db('chat');
			db.collection('user').findOne({email : req.body.email, passwd : req.body.passwd}, (error, user)=>{
			
				res.session.user = user.name;
				res.render('home.ejs');
			
			});
		}
	});
});
