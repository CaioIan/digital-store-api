"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("products", "brand", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.addColumn("products", "gender", {
      type: Sequelize.ENUM("Masculino", "Feminino", "Unisex"),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("products", "brand");
    await queryInterface.removeColumn("products", "gender");
    // Note: Deleting the ENUM type might be necessary depending on the DB dialect (e.g., PostgreSQL)
  },
};
