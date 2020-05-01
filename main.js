var app = require('express')()
var http = require('http').createServer(app);
var path = require('path')
var io = require('socket.io')(http);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


io.on('connection', (socket)=>{

	console.log("User Connected");
	socket.on('chat message', (msg)=>{
	//	console.log("Message is " + msg);
		io.emit('chat message', msg);
	});
	socket.on('disconnect', ()=>{

		console.log("User Disconnected");
	});
});

/*app.get('/home', (req, res)=>{

	res.render('home.ejs')
});
*/

var homeRoute = require('./routes/home');

app.use('/home', homeRoute);

http.listen(3000, ()=>{

	console.log("Server Listening at localhost:3000");
});
