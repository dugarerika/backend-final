'use strict';

const mongoose = require('mongoose');
const readLine = require('readline');
const async = require('async');
require('./lib/i18nSetup');

const db = require('./lib/connectMongoose');

require('./models/Product');

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
			initUsuarios,
			initProduct
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

function initProduct(cb) {
	const Product = mongoose.model('Product');

	Product.deleteMany({}, () => {
		console.log('Productos borrados.');

		// Cargar anuncios.json
		const fichero = './products.json';
		console.log('Cargando ' + fichero + '...');

		Product.cargaJson(fichero, (err, numLoaded) => {
			if (err) return cb(err);

			console.log(`Se han cargado ${numLoaded} productos.`);
			return cb(null, numLoaded);
		});
	});
}

function initUsuarios(cb) {
	const User = require('./models/User');

	User.deleteMany({}, () => {
		console.log('Usuarios borrados.');

		User.insertMany(
			[
				{
					seller: true,
					name: 'Erika Tavera',
					email: 'dugarerika@example.com',
					password: '1234567'
				},
				{
					seller: true,
					name: 'Alvaro',
					email: 'elbarenal@gmail.com',
					password: '1234567'
				},
				{
					seller: true,
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
