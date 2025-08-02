import { Sequelize, DataTypes } from 'sequelize';
import userModel from './user.js';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './app/db/database.sqlite'
});

const User = userModel(sequelize, DataTypes);

export { sequelize, User };
