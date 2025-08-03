export default (sequelize, DataTypes) => {
  	const User = sequelize.define('User', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false
		},
        role: {
            type: DataTypes.ENUM("admin", "user", "moderator"), 
            allowNull: false,
            defaultValue: "user"
        }
	}, {
		tableName: 'Users', // Make sure this matches the name used in the migration
		timestamps: true    // Required if you have createdAt / updatedAt
	});

  return User;
};
