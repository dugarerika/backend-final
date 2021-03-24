var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const bodyparser = require('body-parser');
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

// body parser Middleware
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

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

let server = app.listen(4000, function() {
	let port = server.address().port;
	console.log(
		'Server started at http://localhost:%s',
		port
	);
});

module.exports = app;
