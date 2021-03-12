const mongoose = require('mongoose');
const fs = require('fs-extra');
const flow = require('../lib/flowControl');
const ProductSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: 'Name is required'
	},
	image: {
		data: Buffer,
		contentType: String
	},
	description: {
		type: String,
		trim: true
	},
	category: {
		type: String
	},
	quantity: {
		type: Number,
		required: 'Quantity is required'
	},
	price: {
		type: Number,
		required: 'Price is required'
	},
	updated: Date,
	created: {
		type: Date,
		default: Date.now
	},
	owner: { type: mongoose.Schema.ObjectId, ref: 'User' }
});

ProductSchema.statics.cargaJson = function(fichero, cb) {
	// Encodings: https://nodejs.org/api/buffer.html
	fs.readFile(fichero, { encoding: 'utf8' }, function(
		err,
		data
	) {
		if (err) return cb(err);

		console.log(fichero + ' leido.');

		if (data) {
			const products = JSON.parse(data).products;
			const numproducts = products.length;

			flow.serialArray(
				products,
				Product.createRecord,
				(err) => {
					if (err) return cb(err);
					return cb(null, numproducts);
				}
			);
		}
		else {
			return cb(
				new Error(__('empty_file', { file: fichero }))
			);
		}
	});
};

ProductSchema.statics.createRecord = function(nuevo, cb) {
	new Product(nuevo).save(cb);
};

var Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
