import { DataTypes } from 'sequelize';
import sequalize from '../database.js';

const User = sequalize.define('User', {
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
