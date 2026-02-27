/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // Se deletar o user, deleta os pedidos
      },
      status: {
        type: Sequelize.ENUM("pending", "completed", "cancelled"),
        allowNull: false,
        defaultValue: "completed",
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      shipping: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      personal_info: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: "Snapshot das informações pessoais no ato da compra",
      },
      delivery_address: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: "Snapshot do endereço de entrega selecionado",
      },
      payment_info: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: "Snapshot do método de pagamento (com dados sensíveis mascarados)",
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
    await queryInterface.dropTable("orders");
  },
};
