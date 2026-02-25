const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class UserAddress extends Model {
    static associate(models) {
      UserAddress.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  UserAddress.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      endereco: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      bairro: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cidade: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cep: {
        type: DataTypes.STRING(9),
        allowNull: false,
      },
      complemento: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "UserAddress",
      tableName: "user_addresses",
      underscored: true,
      timestamps: true,
    },
  );

  return UserAddress;
};
