module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE product_options
      MODIFY category_id CHAR(36)
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_bin
      NULL
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE product_options
      MODIFY category_id CHAR(36)
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_bin
      NOT NULL
    `);
  },
};
