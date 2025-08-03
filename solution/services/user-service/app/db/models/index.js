import { Sequelize, DataTypes } from 'sequelize';

import { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT } from '../../env.js';
import userModel from './user.js';

const sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASS,
    {
        host: DB_HOST,
        port: DB_PORT,
        dialect: "postgres",
        logging: console.log
    }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = userModel(sequelize, DataTypes);

export { db };
