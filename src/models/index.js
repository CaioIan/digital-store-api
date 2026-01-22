'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Lê todos os arquivos da pasta atual
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Importa a classe do Model
    const model = require(path.join(__dirname, file));
    // Inicializa o model (passando a conexão sequelize e os DataTypes)
    if (model.init) {
        model.init(sequelize, Sequelize.DataTypes);
    } else {
        // Fallback caso use o padrão de função.
        model(sequelize, Sequelize.DataTypes);
    }
    db[model.name] = model;
  });

// Executa as associações (relacionamentos) se houver
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;