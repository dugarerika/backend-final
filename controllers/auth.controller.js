const User = require('../models/User');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const config = require('../config/config');
var nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const { getMaxListeners } = require('../models/User');
const API_KEY =
	'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';

const forgotPassword = async (req, res) => {
	const message = `Verifica tu email, recibiras un link que te permitira recuperar tu contraseña`;
	let verificationLink;
	let emailstatus = 'OK';
	console.log(req.body.email);
	try {
		let user = await User.findOne({
			email: req.body.email
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

	const htmlEmail = `
		<b>Por favor click en el siguiente link o pegalo en tu navegador para completar el proceso</b>
		<a href="${verificationLink}">${verificationLink}</a>
		`;
	sgMail.setApiKey(API_KEY);
	const msg = {
		to: `${req.body.email}`,
		from: 'Wallarock0@gmail.com',
		subject: 'Recuperacion de contraseña',

		html: htmlEmail
	};

	sgMail
		.send(msg)
		.then((res) => console.log('Email sent'))
		.catch((error) => console.log(error.message));
	return res.status('200').json({
		message: ` Un email con un link ha sido enviado a su correo`
	});

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
	console.log(req.body);
	const htmlEmail = `
		<h1>${req.body.seller}</h1>
			<br />
		<b>Hemos recibido la informacion de que ${req.body
			.shopper} se encuentra interesado en el producto que has subido a nuestra pagina: </b>
		<h2>Producto: ${req.body.name} </h2>
		<h2>Precio: ${req.body.price} </h2>
		<b>Puedes contactacte con alvaro al correo electronico: ${req
			.body.mailshopper} <b>

		`;
	sgMail.setApiKey(API_KEY);
	const msg = {
		to: `${req.body.mailseller}`,
		from: 'Wallarock0@gmail.com',
		subject:
			'Alguien se encuentra interesado en tu producto',

		html: htmlEmail
	};

	sgMail
		.send(msg)
		.then((res) => console.log('Email sent'))
		.catch((error) => console.log(error.message));
	return res.status('200').json({
		message: ` ${req.body
			.shopper} Un email con tus datos ha sido enviado al vendedor para que te contacte`
	});
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
