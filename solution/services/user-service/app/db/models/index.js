import { Sequelize, DataTypes } from 'sequelize';

import { DATABASE_URL } from '../../env.js';
import userModel from './user.js';

const sequelize = new Sequelize(DATABASE_URL,    
    {
        dialect: "postgres",
        logging: console.log
    }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = userModel(sequelize, DataTypes);

export { db };
