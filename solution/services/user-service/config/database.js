import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: 'users.sqlite',
	logging: false
});

export default sequelize;
