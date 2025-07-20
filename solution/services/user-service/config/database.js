const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: 'users.sqlite',
	logging: false
});

module.exports = sequelize;
