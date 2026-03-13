/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("orders", "status", {
      type: Sequelize.ENUM("pending", "completed", "cancelled", "shipped", "delivered"),
      allowNull: false,
      defaultValue: "completed",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("orders", "status", {
      type: Sequelize.ENUM("pending", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "completed",
    });
  },
};
