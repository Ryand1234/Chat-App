var app = require('express')()
var http = require('http').createServer(app);
var path = require('path')
var io = require('socket.io')(http);
var session = require('express-session')
var bodyParser = require('body-parser')

var user;
var active = new Array();
var logged = 0;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({secret:'ChatApp', resave:true, saveUninitialized: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
io.on('connection', (socket)=>{

	console.log(user," Connected");
	socket.on('recive message', (msg)=>{
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


var loginRoute = require('./routes/login');
var registerRoute = require('./routes/register');


app.get('/home', (req, res, next)=>{


	if(req.session.user == undefined)
                res.render('login.ejs')

        if(req.session.user != undefined){
		
		if(logged != 1){

        	        user = req.session.user;
			logged = 1;
			
			if(active == undefined)
				active = [user];
			else
				active.push(user);

                	res.render('chat.ejs');
	        }else{
			res.render('error.ejs');
		}
	}

});
app.use('/login', loginRoute);
app.use('/register', registerRoute);


http.listen(3000, ()=>{

	console.log("Server Listening at localhost:3000");
});
