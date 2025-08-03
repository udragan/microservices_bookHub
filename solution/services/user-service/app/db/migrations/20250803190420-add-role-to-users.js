'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up (queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "role", {
    type: Sequelize.ENUM("admin", "user", "moderator"),
    allowNull: false,
    defaultValue: "user"
    });
}

export async function down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "role");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";');  
}
