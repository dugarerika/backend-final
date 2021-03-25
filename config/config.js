const config = {
	env: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 3000,
	jwtSecret: process.env.JWT_SECRET || 'g(Q5`]mS^"jv%-UK',
	mongoUri:
		process.env.MONGODB_URI ||
		process.env.MONGO_HOST ||
		'mongodb://' +
			(process.env.IP || 'locahost') +
			':' +
			(process.env.MONGO_PORT || '27017') +

			'/mernproject'

};

exports = module.exports = config;
