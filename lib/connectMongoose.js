'use strict';
const mongoose = require('mongoose');

mongoose.connection.on('open', () => {
	console.log(
		'Conectado a MongoDB en',
		mongoose.connection.name
	);
});

mongoose.connection.on('error', (err) => {
	console.log('Error de conexión', err);
	process.exit(1);
});

mongoose.connect('mongodb://localhost/mernproject', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
});

module.exports = mongoose.connection;
