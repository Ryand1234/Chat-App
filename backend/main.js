var app = require('express')()
var http = require('http').createServer(app);
var path = require('path')
var io = require('socket.io')(http);
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

	if(error)
		res.status(200).json({"msg" : "Internal Server Error"});
	else{
	
		var user = client.db('chat').collection('user');
		var history = client.db('chat').collection('history');

		io.on('connection', (socket)=>{
		
			console.log(user," Connected");
			socket.on('recieve message', (msg)=>{
				m1sg = {
					msg : msg,
					user : user
				};
				io.emit('send message', m1sg);
			});
		
			socket.on('disconnect', ()=>{
	
				var msg = user + " Disconnected";
				logged = 0;
				active.pull(user);
				io.emit('Disconnect', msg);
				console.log(msg);
			});
		});

		//Server Listen
		http.listen(3000, ()=>{
			console.log("Server listening at http://localhost:3000");
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

                        var chat = client.db('chat');
                        db.collection('user').findOne({email : req.body.email, passwd : req.body.passwd}, (error, user)=>{

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

                        var db = client.db('chat');
                        db.collection('user').insertOne(data, (error, user)=>{

                                res.render('login.ejs');

                        });
                }
        });
});

