var express = require('express')
var http = require('http').createServer(app);
var path = require('path')
var session = require('express-session')
var bodyParser = require('body-parser')
var { MongoClient, ObjectId } = require('mongodb')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
var path = require('path')

var app = express();
var id;
var database_name;
var user_name = '';
var user_socket = {}
var socket_id = {};
var active = new Array();
var logged = 0;
const MONGO_URI = process.env.MONGOLAB_URI||'mongodb://localhost:5000'
var cri; //Current Room Id


app.use(express.static(__dirname + '/dist'));
app.use(session({secret:'ChatApp', resave:true, saveUninitialized: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true}, (error, client)=>{
  if(error)
      console.log({"msg" : "Internal Server Error"});
  else{
    //Collection Declaration
    var user_db = client.db('chat').collection('user');
    var room_db = client.db('chat').collection('room');
    var message_db = client.db('chat').collection('message')

    //Server Listen
    var server = app.listen(process.env.PORT||3000, ()=>{
            console.log(`Server listening at ${process.env.HOST}:${process.env.PORT||3000}`);
    });

    //Socket Logic
    const io = require('socket.io').listen(server)
    io.on('connection', (socket)=>{
      socket.on('pc', ()=>{
        socket.user_id = id;
        socket.user = user_name;
        user_socket[socket.user] = socket.id;
      })

      // Send Personal Message from client
      socket.on('PC_client', (msg)=>{
        data = {
            message: msg.message,
            sender: socket.user
        }
        user_db.findOne({_id : ObjectId(socket.user_id)}, (err, user)=>{
          user_db.findOne({_id : ObjectId(msg._id)}, (erR, Ruser)=>{
              var i, exist = false
              var id = null
              for(i = 0; i < user.pc.length; i++){
                  if(user.pc[i].user == Ruser.name)
                  {
                      id = user.pc[i]._id;
                      exist = true;
                      break;
                  }
              }
            if(!exist){
              var data = {
                  message : [{
                    message : msg.message,
                    user : user.name
                  }]
              }
              message_db.insertOne(data, (errorIn, message)=>{
                var message_user = {
                  user : Ruser.name,
                  _id : message.ops[0]._id
                }
                var recive_user = {
                  user : user.name,
                  _id : message.ops[0]._id
                }

                var pcU = user.pc;
                if(pcU.length == 0){
                    pcU = [message_user];
                }
                else{
                  pcU.push(message_user);
                }

                var pcR = Ruser.pc;
                if(pcR.length == 0){
                  pcR = [recive_user];
                }
                else{
                  pcR.push(recive_user);
                }

                user_db.updateOne({ _id : new ObjectId(socket.user_id)}, { $set : { pc : pcU } } )
                user_db.updateOne({ _id : new ObjectId(msg._id)}, { $set: { pc : pcR } }, (e, upd)=>{
                
                  socket.to(user_socket[Ruser.name]).emit("PC_server", data.message);
                  socket.emit("PC_server", data.message);
                });
              });
            }
            else{
              var new_message = {
                  message : msg.message,
                  user : socket.user
              }
              message_db.findOne({ _id : ObjectId(id)}, (e, message)=>{
                var old_message = message.message;
                old_message.push(new_message);
                message_db.updateOne({ _id : ObjectId(id)}, { $set : { message : old_message } }, (er, upd)=>{
                    socket.to(user_socket[Ruser.name]).emit("PC_server", new_message);
                    socket.emit("PC_server", new_message);
                });
              });
            }
          });
        });
      });

      socket.on('con', ()=>{
          socket.user = user_name;
          socket.database_id = cri;
          socket.join(database_name);
          socket.database_name = database_name;
          socket.join(database_name);
      });

      socket.on('leave', ()=>{
        socket.leave(socket.database_name);
      });

      socket.on('client', (msg)=>{                 
        var m1sg = {
          message : msg.message,
          user : socket.user
        };

        room_db.findOne({_id : ObjectId(socket.database_id) }, (err, room)=>{
          if(err)
              console.log("Error: ", err);

          var history = room.history;
          if(history == undefined)
              history = [m1sg];
          else
              history.push(m1sg);

          room_db.updateOne({_id : ObjectId(socket.database_id) } , { $set : { history : history } }, (err1, update)=>{
            if(err1)
              console.log("Error");
            var room_name = room.name;
            io.sockets.in(room_name).emit('server', m1sg);
          });
        });
      });
      
      socket.on('disconnect', ()=>{
        var msg = user_name + " Disconnected";
        io.emit('Disconnect', msg);
      });
    });
  }
});


//For All routes
app.get('/*', function(req, res) {
res.sendFile(path.join(__dirname, '/dist/frontend/index.html'));
});

//Routes related to Chat/Chat Rooms
//Create Chat Room
app.post('/api/room/create', (req, res, next)=>{
  var new_room = {
    name : req.body.name,
    history : new Array(),
    users : new Array()
  }

  MongoClient.connect(MONGO_URI, (error, client)=>{
    var room_db = client.db('chat').collection('room');
    room_db.insertOne(new_room, (err, room)=>{
      if(err)
        res.status(500).json({"err" : "Error Creating Room "});
      else
        res.status(200).json({"msg" : "Room Created" });
    });
  });
});


//Get All Rooms
app.post('/api/rooms', (req, res, next)=>{

  MongoClient.connect(MONGO_URI, (error, client)=>{
    client.db('chat').collection('room').find({}).toArray((err, rooms)=>{
        if((rooms.length > 0)&&(rooms != null)){
            for(var i = 0; i<rooms.length; i++){
              rooms[i]['_id'] = rooms[i]['_id'].toString();
            }
        }
        if(err)
          res.status(500).json({"err" : "Internal Server Error"});
        else
          res.status(200).json(rooms);
    })
  })
})

//Join Chat Room
app.post('/api/room/join/:room', (req, res, next)=>{

  var room_id = req.params.room;
  if(req.session._id != null){
    MongoClient.connect(MONGO_URI, (error, client)=>{
      var room_db = client.db('chat').collection('room');
      var user_db = client.db('chat').collection('user');
      var name;
      var present = false;
      cri = room_id; 
      user_name = req.session.user;
      room_db.findOne({_id : ObjectId(room_id)}, (err, room)=>{
        var user = room.users;
        database_name = room.name;
        if(user != undefined){
          for(var i = 0; i < user.length; i++){
            if(user[i][1].equals(ObjectId(req.session._id))){
              present = true;
              break;
            }
          }
        }
        name = room.name;
        req.session.database_id = room_id;
        if(present == false){
            if(user == undefined)
              user = [[req.session.user, ObjectId(req.session._id)]];
            else
              user.push([req.session.user, ObjectId(req.session._id)]);
            room_db.updateOne({_id : ObjectId(room_id)}, {$set : { users : user } }, (err, update)=>{
                if(err)
                  res.status(500).json({"err" : "Internal Server Error"});
            });
            user_db.findOne({_id : ObjectId(req.session._id)}, (err, user)=>{
                var room = user.rooms;
                if(room == undefined)
                  room = [[ name,  ObjectId(room_id)]];
                else
                  room.push([name,  ObjectId(room_id)]);
                user_db.updateOne({_id : ObjectId(req.session._id)}, { $set : { rooms : room } } , (err, update)=>{
                    if(err)
                        res.status(500).json({"err" : "Internal Server Error"});
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
    res.status(500).json({"err" : "Please Login to join a room"});
});


//Retrieve Old Message of Room from Database
app.post('/api/room/chat/history', (req, res, next)=>{

  MongoClient.connect(MONGO_URI, (error, client)=>{
    var room_db = client.db('chat').collection('room');
    room_db.findOne({_id : ObjectId(req.session.database_id)}, (err, room)=>{
      res.status(200).json(room.history);
    });
  });
});


//Retrive Old Message of Personal User
app.post('/api/chat/history/:id', (req, res, next)=>{

var token = req.params.id;
 MongoClient.connect(MONGO_URI, (error, client)=>{
    
    var user_db = client.db('chat').collection('user')
    user_db.findOne({_id : ObjectId(token)}, (err, Ruser)=>{
        user_db.findOne({_id: ObjectId(req.session._id)}, (err1, user)=>{
            user_name = user.name;
            id = user['_id'].toString();
            var ruser = Ruser.name;
            var pc = user.pc;

            if(pc.length == 0){
                res.status(200).json({"msg" : "No History"});
            }
            else{
                var j;
                for(var i = 0; i < pc.length; i++)
                {
                    if(ruser == pc[i].user)
                    {
                        j = i;
                        break;
                    }
                }
                var message_db = client.db('chat').collection('message');
                message_db.findOne({_id : ObjectId(pc[i]._id)}, (err2, message)=>{                
                    if(message == null)
                      res.status(500).json({"err" : "Messages Deleted"});
                    else
                      res.status(200).json(message.message);
                });
            }
        });
    });
});
});


//Routes related to Authentication/User


//Get All Users
app.post('/api/users', (req, res, next)=>{

var user_array = new Array();
if(req.session._id != undefined){
     MongoClient.connect(MONGO_URI, (error, client)=>{

        var user_db = client.db('chat').collection('user');
        user_db.find({}).toArray((err, user)=>{

            for(var i = 0; i < user.length; i++){

                if(user[i].name != req.session.user){
                    if(user_array == undefined)
                        user_array = [user[i]];
                    else
                        user_array.push(user[i]);
                }
            }

            res.status(200).json(user_array);

        });
    });
  }
  else{
      res.status(500).json({"err" : "Please Login to send Personal Message"})
  }
});

//Active User Endpoint
app.post('/api/user/active',(req, res, next)=>{

  if(active.length > 0)
  {
      res.status(200).json(active);
  }
  else
    res.status(500).json({"err" : "No active User"});
});


//Login End Point
app.post('/api/user/login', (req, res, next)=>{

     MongoClient.connect(MONGO_URI, (err, client)=>{
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
              req.session._id = user._id;
              req.session.user = user.name;
              res.status(200).json({"msg" : "Login SuccessFUll"});
            }
              else
                  res.status(500).json({"err" : "Incorrect Password"});
          } else
           res.status(500).json({"err" : "Incorrect Email"});
        });
      }
    });
});


//Logout EndPoint
app.post('/api/user/logout', (req, res, next)=>{

var msg = req.session.user + " Disconnected";
    var i = active.indexOf(req.session.user);
if(i > -1)
    active.splice(i, 1);


req.session.destroy((err) => {

            if(err) {
                    res.status(200).json({"msg" : "Error in Logout"});
            }
            else{

        res.status(200).json({"msg" : "Logout Sucessfull"});
    }
    });

});


//Register EndPoint
app.post('/api/user/register', (req, res, next)=>{

var hashedPasswd = bcrypt.hashSync(req.body.passwd, 8);
console.log("Hashed Password: ",hashedPasswd);
    var data = {
            email : req.body.email,
            passwd : hashedPasswd,
            name : req.body.name,
    mobile: req.body.mobile,
    username: req.body.username,
    room : new Array(),
    pc : new Array()
    };

     MongoClient.connect(MONGO_URI, (err, client)=>{

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

