const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      Product.hasMany(models.ProductImage, {
        foreignKey: "product_id",
        as: "images",
        onDelete: "CASCADE",
      });
      Product.hasMany(models.ProductOption, {
        foreignKey: "product_id",
        as: "options",
        onDelete: "CASCADE",
      });
      Product.belongsToMany(models.Category, {
        through: models.ProductCategory,
        foreignKey: "product_id",
        otherKey: "category_id",
        as: "categories",
      });
      Product.hasMany(models.CartItem, {
        foreignKey: "product_id",
        as: "cartItems",
        onDelete: "CASCADE",
      });
    }
  }

  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      use_in_menu: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM("Masculino", "Feminino", "Unisex"),
        allowNull: true,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      price_with_discount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "product",
      tableName: "products",
      underscored: true,
      timestamps: true,
    },
  );

  return Product;
};
