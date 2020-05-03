var app = require('express')()
var http = require('http').createServer(app);
var path = require('path')
var io = require('socket.io')(http);
var session = require('express-session')
var bodyParser = require('body-parser')

var user;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({secret:'ChatApp', resave:true, saveUninitialized: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
io.on('connection', (socket)=>{

	console.log(user," Connected");
	socket.on('chat message', (msg)=>{
		m1sg = {
			msg : msg,
			user : user
		};
		io.emit('chat message', m1sg);
	});
	socket.on('disconnect', ()=>{

		console.log(user," Disconnected");
	});
});


var loginRoute = require('./routes/login');
var registerRoute = require('./routes/register');


app.get('/home', (req, res, next)=>{

	if(req.session.user == undefined)
                res.render('login.ejs')

        if(req.session.user != undefined){

                user = req.session.user;
                res.render('chat.ejs');
        }

});
app.use('/login', loginRoute);
app.use('/register', registerRoute);


http.listen(3000, ()=>{

	console.log("Server Listening at localhost:3000");
});
