const User = require('../models/User');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const config = require('../config/config');
var nodemailer = require('nodemailer');

const forgotPassword = async (req, res) => {
	const data = req.body;
	console.log(req);

	const message = `Verifica tu email, recibiras un link que te permitira recuperar tu contraseña`;
	let verificationLink;
	let emailstatus = 'OK';
	console.log(req.body.data.email);
	try {
		let user = await User.findOne({
			email: req.body.data.email
		});
		if (!user)
			return res.status('401').json({
				error: 'el email es requerido'
			});

		const token = jwt.sign(
			{
				_id: user._id,
				name: user.name
			},
			config.jwtSecret,
			{ expiresIn: '10m' }
		);

		verificationLink = `http://localhost:3000/auth/new-password/${token}`;
	} catch (err) {
		return res.status('401').json({
			error: 'Could not create new token'
		});
	}

	try {
		const smtpTransport = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			/* service: "Gmail", */
			port: 465,
			service: 'gmail',
			auth: {
				user: 'WallaRock0@gmail.com',
				pass: 'pvnahdujnuovnqqe'
			}
		});

		const htmlEmail = `
		<b>Por favor click en el siguiente link o pegalo en tu navegador para completar el proceso</b>
		<a href="${verificationLink}">${verificationLink}</a>
		`;
		const mailOptions = {
			from: 'WallaRock0@gmail.com',
			to: `${req.body.data.email}`,
			subject: 'Recuperacion de contraseña',
			html: htmlEmail
		};

		await smtpTransport.sendMail(mailOptions, function(
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
	} catch (err) {
		return res.status(400).json({
			error: errorHandler.getErrorMessage(err)
		});
	}

	try {
		await user.save();
	} catch (err) {
		emailstatus = error;
		return res.status(400).json({
			error: errorHandler.getErrorMessage(err)
		});
	}

	res.json({
		message,
		info: emailstatus,
		test: verificationLink
	});
};

const signin = async (req, res) => {
	try {
		let user = await User.findOne({
			email: req.body.email
		});

		if (!user)
			return res.status('401').json({
				error: 'User not found'
			});

		if (!user.authenticate(req.body.password)) {
			return res.status('401').send({
				error: "Email and password don't match."
			});
		}

		const token = jwt.sign(
			{
				_id: user._id
			},
			config.jwtSecret
		);

		res.cookie('t', token, {
			expire: new Date() + 9999
		});

		return res.json({
			token,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				seller: user.seller
			}
		});
	} catch (err) {
		return res.status('401').json({
			error: 'Could not sign in'
		});
	}
};

const signout = (req, res) => {
	res.clearCookie('t');
	return res.status('200').json({
		message: 'signed out'
	});
};

const requireSignin = expressJwt({
	secret: config.jwtSecret,
	userProperty: 'auth',
	algorithms: [
		'sha1',
		'RS256',
		'HS256'
	]
});

const sendEmail = async (req, res) => {
	const data = req.body;

	const smtpTransport = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		/* service: "Gmail", */
		port: 465,
		service: 'gmail',
		auth: {
			user: 'WallaRock@gmail.com',
			pass: 'pvnahdujnuovnqqe'
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
		to: 'dugarerika@gmail.com',
		replyTo: 'dugarerika@gmail.com',
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
};

const hasAuthorization = (req, res, next) => {
	const authorized =
		req.profile &&
		req.auth &&
		req.profile._id == req.auth._id;
	if (!authorized) {
		return res.status('403').json({
			error: 'User is not authorized'
		});
	}
	next();
};

exports = module.exports = {
	forgotPassword,
	signin,
	signout,
	sendEmail,
	requireSignin,
	hasAuthorization
};
