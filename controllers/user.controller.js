var extend = require('lodash/extend');
const errorHandler = require('../helpers/dbErrorHandler');
const request = require('request');
const config = require('../config/config');
const stripe = require('stripe');
const User = require('../models/User');
const myStripe = stripe(config.stripe_test_secret_key);

const create = async (req, res) => {
	const user = new User(req.body);
	try {
		await user.save();
		return res.status(200).json({
			message: 'Successfully signed up!'
		});
	} catch (err) {
		return res.status(400).json({
			error: errorHandler.getErrorMessage(err)
		});
	}
};

/**
 * Load user and append to req.
 */
const userByID = async (req, res, next, id) => {
	try {
		let user = await User.findById(id);
		if (!user)
			return res.status('400').json({
				error: 'User not found'
			});
		req.profile = user;
		next();
	} catch (err) {
		return res.status('400').json({
			error: 'Could not retrieve user'
		});
	}
};

const read = (req, res) => {
	req.profile.hashed_password = undefined;
	req.profile.salt = undefined;
	return res.json(req.profile);
};

const list = async (req, res) => {
	try {
		let users = await User.find().select(
			'name email updated created'
		);
		res.json(users);
	} catch (err) {
		return res.status(400).json({
			error: errorHandler.getErrorMessage(err)
		});
	}
};

const update = async (req, res) => {
	try {
		let user = req.profile;
		user = extend(user, req.body);
		user.updated = Date.now();
		await user.save();
		user.hashed_password = undefined;
		user.salt = undefined;
		res.json(user);
	} catch (err) {
		return res.status(400).json({
			error: errorHandler.getErrorMessage(err)
		});
	}
};

const remove = async (req, res) => {
	try {
		let user = req.profile;
		let deletedUser = await user.remove();
		deletedUser.hashed_password = undefined;
		deletedUser.salt = undefined;
		res.json(deletedUser);
	} catch (err) {
		return res.status(400).json({
			error: errorHandler.getErrorMessage(err)
		});
	}
};

const stripe_auth = (req, res, next) => {
	request(
		{
			url: 'https://connect.stripe.com/oauth/token',
			method: 'POST',
			json: true,
			body: {
				client_secret: config.stripe_test_secret_key,
				code: req.body.stripe,
				grant_type: 'authorization_code'
			}
		},
		(error, response, body) => {
			//update usuario
			if (body.error) {
				return res.status('400').json({
					error: body.error_description
				});
			}
			req.body.stripe_seller = body;
			next();
		}
	);
};

const stripeCustomer = (req, res, next) => {
	if (req.profile.stripe_customer) {
		//update stripe cliente
		myStripe.customers.update(
			req.profile.stripe_customer,
			{
				source: req.body.token
			},
			(err, customer) => {
				if (err) {
					return res.status(400).send({
						error: 'Could not update charge details'
					});
				}
				req.body.order.payment_id = customer.id;
				next();
			}
		);
	}
	else {
		myStripe.customers
			.create({
				email: req.profile.email,
				source: req.body.token
			})
			.then((customer) => {
				User.update(
					{ _id: req.profile._id },
					{ $set: { stripe_customer: customer.id } },
					(err, order) => {
						if (err) {
							return res.status(400).send({
								error: errorHandler.getErrorMessage(err)
							});
						}
						req.body.order.payment_id = customer.id;
						next();
					}
				);
			});
	}
};

exports = module.exports = {
	create,
	userByID,
	read,
	list,
	remove,
	update,
	stripe_auth,
	stripeCustomer
};
