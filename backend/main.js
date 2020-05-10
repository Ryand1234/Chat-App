var app = require('express')()
var http = require('http').createServer(app);
var path = require('path')
var socket = require('socket.io');
var session = require('express-session')
var bodyParser = require('body-parser')
var mongo = require('mongodb')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')

var user_name = '';
var active = new Array();
var logged = 0;
const MONGO_URL = 'mongodb://localhost:5000';


app.use(session({secret:'ChatApp', resave:true, saveUninitialized: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongo.MongoClient.connect(MONGO_URL, (error, client)=>{

	/*if(error)
		res.status(200).json({"msg" : "Internal Server Error"});*/
	{
	
		var user_db = client.db('chat').collection('user');
		var history_db = client.db('chat').collection('history');

		 //Server Listen
                var server = app.listen(3000, ()=>{
                        console.log("Server listening at http://localhost:3000");
                });

		const io = socket.listen(server)
		io.on('connection', (socket)=>{
		

			console.log("USER: ",user_name);
		
				socket.on('client', (msg)=>{
					m1sg = {
						message : msg.message,
						user : user_name
					};
					
					history_db.insertOne(m1sg, (err, insert)=>{
						if(err)
							console.log("Error: ", err);

						io.emit('server', m1sg);
					});
				});
		
				socket.on('disconnect', ()=>{
	
					var msg = user_name + " Disconnected";
					io.emit('Disconnect', msg);
					console.log(msg);
				});
		});

	}
});


//Retrieve Old Message from Database
app.get('/message/history', (req, res, next)=>{

	mongo.MongoClient.connect(MONGO_URL, (error, client)=>{
	
		var history = client.db('chat').collection('history');
		history.find({}).toArray((err, message)=>{
			res.status(200).json(message);
		});
	});
});


//Active User Endpoint
app.get('/user/active',(req, res, next)=>{

	if(active.length > 0)
	{
		res.status(200).json(active);
	}
	else
		res.status(200).json({"msg" : "No active User"});
});

//Login End Point
app.post('/user/login', (req, res, next)=>{

        mongo.MongoClient.connect('mongodb://localhost:5000', (err, client)=>{

                if(err)
                        res.status(200).json({"msg" : "Error"});
                else{

                        var user_db = client.db('chat').collection('user')
			user_db.findOne({email : req.body.email}, (error, user)=>{

                                if (user != null){
					var isValid = bcyrpt.compareSync(req.body.passwd, user.passwd);
					if(isValid)
					{
						user_name = user.name;

	       			                if(active == undefined)
        	               			        active = [user_name];
	        	        	        else
        	        	        	        active.push(user_name);

						console.log("ARRAY: ",active);
                                        	res.status(200).json({"msg" : "Login SuccessFUll"});
					}
					else
						res.status(200).json({"msg" : "Incorrect Password"});
                                }else
                                        res.status(200).json({"msg" : "Incorrect Email"});

                        });
                }
        });
});


//Logout EndPoint
app.get('/user/logout', (req, res, next)=>{

	req.session.destroy((err) => {

                if(err) {
                        res.status(200).json({"msg" : "Error in Logout"});
                }
                else{
			var msg = user + " Disconnected";
                        active.pull(user_name);
                        console.log(msg);
			user_name= '';
			res.status(200).json({"msg" : "Logout Sucessfull"});
		}
        });

});


//Register EndPoint
app.post('/user/register', (req, res, next)=>{

	var hashedPasswd = bcrypt.hashSync(req.body.passwd, 8);
	console.log("Hashed Password: ",hashedPasswd);
        var data = {
                email : req.body.email,
                passwd : hashedPasswd,
                name : req.body.name,
		mobile: req.body.mobile,
		username: req.body.username
        };

        mongo.MongoClient.connect('mongodb://localhost:5000', (err, client)=>{

                if(err)
                        res.status(200).json({"msg" : "Error"});
                else{

                        var user_db = client.db('chat').collection('user')
			user_db.insertOne(data, (error, user)=>{

                             res.status(200).json({"msg" : "User Registered"});

                        });
                }
        });
});

