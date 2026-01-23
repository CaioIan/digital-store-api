const Sequelize = require('sequelize');
const config = require('../config/database');

const dbConfig = config[process.env.NODE_ENV || 'development'];

const connection = new Sequelize(dbConfig);

module.exports = connection;