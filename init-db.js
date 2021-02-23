'use strict';

const mongoose = require('mongoose');
const readLine = require('readline');
const async = require('async');
require('./lib/i18nSetup');

const db = require('./lib/connectMongoose');

db.once('open', function() {
	const rl = readLine.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.question(
		'Are you sure you want to empty DB? (no) ',
		function(answer) {
			rl.close();
			if (answer.toLowerCase() === 'yes') {
				runInstallScript();
			}
			else {
				console.log('DB install aborted!');
				return process.exit(0);
			}
		}
	);
});

function runInstallScript() {
	async.series(
		[
			initUsuarios
		],
		(err) => {
			if (err) {
				console.error(__('generic', { err }));
				return process.exit(1);
			}

			return process.exit(0);
		}
	);
}

function initUsuarios(cb) {
	const User = require('./models/user.model');

	User.deleteMany({}, () => {
		console.log('Usuarios borrados.');

		User.insertMany(
			[
				{
					seller: false,
					name: 'Erika Tavera',
					email: 'dugarerika@example.com',
					password: '1234567'
				},
				{
					name: 'Alvaro',
					email: 'elbarenal@gmail.com',
					password: '1234567'
				},
				{
					name: 'Francois',
					email: 'francoisg@itechcare.net',
					password: '1234567'
				}
			],
			(err, loaded) => {
				if (err) return cb(err);

				console.log(
					`Se han cargado ${loaded.length} usuarios.`
				);
				return cb(null, loaded);
			}
		);
	});
}
