/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("order_items", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // Deletar pedido deleta os itens
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Pode ser null se o produto for excluído depois, mantemos o histórico no pedido
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", // Se deletar o produto, mantemos o item do pedido mas sem referência DB
      },
      product_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      price_at_purchase: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      selected_color: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      selected_size: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("order_items");
  },
};
