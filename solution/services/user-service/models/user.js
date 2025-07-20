import { DataTypes } from 'sequelize';
import { define } from '../config/database';

const User = define('User', {
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	email: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false
	}
});

export default User;
