const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, {
        foreignKey: "order_id",
        as: "order",
      });
      OrderItem.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
    }
  }

  OrderItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      product_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      price_at_purchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      selected_color: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      selected_size: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "OrderItem",
      tableName: "order_items",
      timestamps: true,
      underscored: true,
    }
  );

  return OrderItem;
};
