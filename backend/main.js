var app = require('express')()
var http = require('http').createServer(app);
var path = require('path')
var socket = require('socket.io');
var session = require('express-session')
var bodyParser = require('body-parser')
var mongo = require('mongodb')

var user;
var active = new Array();
var logged = 0;


app.use(session({secret:'ChatApp', resave:true, saveUninitialized: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongo.MongoClient.connect('mongodb://localhost:5000', (error, client)=>{

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
		
			socket.on('client', (msg)=>{
				m1sg = {
					msg : msg.message,
					user : user
				};
				
				io.emit('server', msg);
			});
		
			socket.on('disconnect', ()=>{
	
				var msg = user + " Disconnected";
				io.emit('Disconnect', msg);
				console.log(msg);
			});
		});

	}
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
			user_db.findOne({email : req.body.email, passwd : req.body.passwd}, (error, user)=>{

                                if (user != null){
					if(logged != 1)
					{
						console.log("USER: ",user);
	                                        req.session.user = user.name;
						logged = 1;

        			                if(active == undefined)
                        			        active = [user];
		                	        else
	        	                	        active.push(user);
					}
					else
						res.status(200).json({"msg" : "User Already Logged In"});

                                        res.writeHead(200,
                		                { Location: 'http://localhost:5000/home'}
        	                	);
		                        res.end();
                                }else
                                        res.status(200).json({"msg" : "Incorrect Email/Password"});

                        });
                }
        });
});


//Logout EndPoint
app.post('/user/logout', (req, res, next)=>{

	req.session.destroy((err) => {

                if(err) {
                        res.status(200).json({"msg" : "Error in Logout"});
                }
                else{
			var msg = user + " Disconnected";
                        logged = 0;
                        active.pull(user);
                        console.log(msg);
			res.status(200).json({"msg" : "Logout Sucessfull"});
		}
        });

});


//Register EndPoint
app.post('/user/register', (req, res, next)=>{

        var data = {
                email : req.body.email,
                passwd : req.body.passwd,
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

                             res.writeHead(200,
				     { Location: 'http://localhost:3000/login'}
			     );

				res.send();

                        });
                }
        });
});

