var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var nodemailer = require('nodemailer');
var cors = require('cors');

var app = express();
const CURRENT_WORKING_DIR = process.cwd();

//Solucionamos problema de CORS
app.use(cors({ credentials: true, origin: true }));

// conectar a la base de datos
require('./lib/connectMongoose');
app.use(
	'/public',
	express.static(path.join(CURRENT_WORKING_DIR, 'public'))
);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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

app.post('/api/form', (req, res) => {
	const data = req.body;

	const smtpTransport = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		/* service: "Gmail", */
		port: 465,
		service: 'gmail',
		auth: {
			user: 'mariami3004@gmail.com',
			pass: '@31723Summit'
		}
	});

	const htmlEmail = `
	  <h3>Email enviado desde Wallarock</h3>
	  <ul>
	  <li>Email: ${data.email}</li>
	  <li>Asunto: ${data.asunto}</li>
	  </ul>
	  <h3>Mensaje</h3>
	  <p>${data.mensaje}</p>
	  `;

	const mailOptions = {
		from: `mariami3004@gmail.com`,
		to: 'elbarenal@gmail.com',
		replyTo: 'elbarenal@gmail.com',
		subject: `${data.asunto}`,
		/* text: req.body.mensaje, */
		html: htmlEmail
	};

	smtpTransport.sendMail(mailOptions, function(
		error,
		info
	) {
		console.log(mailOptions);
		console.log(info);
		if (error) {
			return console.log(error);
		}
		console.log('Message sent: ' + info.response);
	});

	smtpTransport.close();
});

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

module.exports = app;
