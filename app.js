var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require ('cors');


var app = express();

const bodyparser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const CURRENT_WORKING_DIR = process.cwd();

//Solucionamos problema de CORS
app.use(cors({credentials: true, origin:true}));

// conectar a la base de datos
require('./lib/connectMongoose');
app.use(
	'/public',
	express.static(path.join(CURRENT_WORKING_DIR, 'public'))
);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//static forder
app.use(
	express.static(
		'/public',
		express.static(path.join(__dirname, 'public'))
	)
);

// body parser Middleware
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index.routes'));
app.use('/users', require('./routes/users.routes'));
app.use('/', require('./routes/user.routes'));
app.use('/', require('./routes/auth.routes'));
app.use('/', require('./routes/shop.routes'));
app.use('/', require('./routes/product.routes'));
app.use('/', require('./routes/order.routes'));





// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error =

			req.app.get('env') === 'development' ? err :
			{};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

app.post('/send-email', function(req, res) {
	let transporter = nodeMailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			// should be replaced with real sender's account
			user: 'hello@gmail.com',
			pass: 'test'
		}
	});
	let mailOptions = {
		// should be replaced with real recipient's account
		to: 'dugaerika@gmail.com',
		subject: req.body.subject,
		text: req.body.message
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log(
			'Message %s sent: %s',
			info.messageId,
			info.response
		);
	});
	res.writeHead(301, { Location: 'index.html' });
	res.end();
});

let server = app.listen(4000, function() {
	let port = server.address().port;
	console.log(
		'Server started at http://localhost:%s',
		port
	);
});

module.exports = app;
