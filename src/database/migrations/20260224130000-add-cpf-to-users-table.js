/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Adiciona coluna como nullable primeiro
    await queryInterface.addColumn("users", "cpf", {
      type: Sequelize.STRING(14),
      allowNull: true,
      after: "surname",
    });

    // 2. Atualiza registros existentes com valores placeholder únicos
    const [users] = await queryInterface.sequelize.query("SELECT id FROM users WHERE cpf IS NULL");
    for (let i = 0; i < users.length; i++) {
      await queryInterface.sequelize.query(
        `UPDATE users SET cpf = '00000000${String(i).padStart(3, '0')}' WHERE id = '${users[i].id}'`
      );
    }

    // 3. Altera para NOT NULL e adiciona UNIQUE
    await queryInterface.changeColumn("users", "cpf", {
      type: Sequelize.STRING(14),
      allowNull: false,
    });

    await queryInterface.addIndex("users", ["cpf"], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "cpf");
  },
};
