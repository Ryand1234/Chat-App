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
var socket_id = {};
var active = new Array();
var logged = 0;
const MONGO_URL = 'mongodb://localhost:5000';
var cri; //Current Room Id


app.use(session({secret:'ChatApp', resave:true, saveUninitialized: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongo.MongoClient.connect(MONGO_URL, (error, client)=>{

	/*if(error)
		res.status(200).json({"msg" : "Internal Server Error"});*/
	{
	
		var user_db = client.db('chat').collection('user');
		var room_db = client.db('chat').collection('room');

		 //Server Listen
                var server = app.listen(3000, ()=>{
                        console.log("Server listening at http://localhost:3000");
                });

		const io = socket.listen(server)
		io.on('connection', (socket)=>{
		

			socket.user = user_name;
			socket.database_id = cri;
			console.log("USER: ",user_name);
		
				socket.on('client', (msg)=>{
					m1sg = {
						message : msg.message,
						user : socket.user
					};
					

	//				console.log("ID: ",socket.database_id);
					room_db.findOne({_id : new mongo.ObjectId(socket.database_id) }, (err, room)=>{
						if(err)
							console.log("Error: ", err);

						var history = room.history;
						if(history == undefined)
							history = [m1sg];
						else
							history.push(m1sg);

						room_db.updateOne({_id : new mongo.ObjectId(socket.database_id) } , { $set : { history : history } }, (err1, update)=>{
						
							if(err1)
								console.log("Error");
							io.emit('server', m1sg);
						});
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


//Routes related to Chat/Chat Rooms


//Create Chat Room
app.post('/room/create', (req, res, next)=>{

	var new_room = {
		name : req.body.name,
		history : new Array(),
		users : new Array()
	}

	mongo.MongoClient.connect(MONGO_URL, (error, client)=>{

		var room_db = client.db('chat').collection('room');
		room_db.insertOne(new_room, (err, room)=>{
			if(err)
				res.status(200).json({"msg" : "Error Creating Room "});
			else
				res.status(200).json({"msg" : "Room Created" });
		});
	});
});


//Get All Rooms
app.get('/rooms', (req, res, next)=>{

	mongo.MongoClient.connect(MONGO_URL, (error, client)=>{
	
		client.db('chat').collection('room').find({}).toArray((err, rooms)=>{
		
			console.log("ROOM: ",rooms);
			if((rooms.length > 0)&&(rooms != null)){
				for(var i = 0; i<rooms.length; i++){
					rooms[i]['_id'] = rooms[i]['_id'].toString();
				}
	//			console.log("ROOMS: ",rooms);
			}
			if(err)
				res.status(200).json({"msg" : "Internal Server Error"});
			else
				res.status(200).json(rooms);
		});
	});
});

//Join Chat Room
app.get('/room/join/:room', (req, res, next)=>{

	var room_id = req.params.room;
	if(req.session._id != null){
	mongo.MongoClient.connect(MONGO_URL, (error, client)=>{
	
		var room_db = client.db('chat').collection('room');
		var user_db = client.db('chat').collection('user');
		var name;
		var present = false;
		cri = room_id;

		room_db.findOne({_id : mongo.ObjectId(room_id)}, (err, room)=>{
		
			var user = room.users;
			if(user != undefined){
				for(var i = 0; i < user.length; i++){
				
					if(user[i][1].equals(new mongo.ObjectId(req.session._id))){
						present = true;
						break;
					}
			//		else{
			//			console.log("USER: ",user[i][1]," REQ: ",req.session._id);
			//		}
				}
			}
			//console.log("IN PRE: ",present);
			name = room.name;
			req.session.database_id = room_id;
			if(present == false){
				
				if(user == undefined)
					user = [[req.session.user, new mongo.ObjectId(req.session._id)]];
				else
					user.push([req.session.user, new mongo.ObjectId(req.session._id)]);
				room_db.updateOne({_id : new mongo.ObjectId(room_id)}, {$set : { users : user } }, (err, update)=>{
				
					if(err)
						res.status(200).json({"msg" : "Internal Server Error"});
	
				});
				user_db.findOne({_id : new mongo.ObjectId(req.session._id)}, (err, user)=>{
					var room = user.rooms;
					if(room == undefined)
						room = [[ name, mongo.ObjectId(room_id)]];
					else
						room.push([name, mongo.ObjectId(room_id)]);
		
					user_db.updateOne({_id : new mongo.ObjectId(req.session._id)}, { $set : { rooms : room } } , (err, update)=>{
						if(err)
							res.status(200).json({"msg" : "Internal Server Error"});
						else{
							res.status(200).json({"msg" : "Room Joined"});
						}
					});
				});
			}
			else
				res.status(200).json({"msg" : "User Already in room"});
		});
	});
	}
	else
		res.status(200).json({"msg" : "Please Login to join a room"});
});


//Retrieve Old Message from Database
app.get('/message/history', (req, res, next)=>{

	mongo.MongoClient.connect(MONGO_URL, (error, client)=>{
	
		var room_db = client.db('chat').collection('room');
		room_db.findOne({_id : new mongo.ObjectId(req.session.database_id)}, (err, room)=>{
			//console.log("ROOM: ",room," ID: ",req.session.database_id," Type: ",typeof req.session.database_id);
			res.status(200).json(room.history);
		});
	});
});



//Routes related to Authentication/User

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
					var isValid = bcrypt.compareSync(req.body.passwd, user.passwd);
					if(isValid)
					{
						user_name = user.name;

	       			                if(active == undefined)
        	               			        active = [user_name];
	        	        	        else
        	        	        	        active.push(user_name);

						console.log("ARRAY: ",active);
						req.session._id = user._id;
						req.session.user = user.name;
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

	var msg = req.session.user + " Disconnected";
                        active.pull(req.session.user);

	req.session.destroy((err) => {

                if(err) {
                        res.status(200).json({"msg" : "Error in Logout"});
                }
                else{
	
                        console.log(msg);
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
		username: req.body.username,
		room : new Array()
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

