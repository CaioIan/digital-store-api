/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "phone", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      after: "email",
    });

    // Verifica se deleted_at já existe antes de adicionar
    const tableDesc = await queryInterface.describeTable("users");
    if (!tableDesc.deleted_at) {
      await queryInterface.addColumn("users", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        after: "role",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "phone");
    const tableDesc = await queryInterface.describeTable("users");
    if (tableDesc.deleted_at) {
      await queryInterface.removeColumn("users", "deleted_at");
    }
  },
};
