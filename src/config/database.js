require('dotenv').config();

module.exports = {
  development: {
    username: 'root',
    password: 'senha-root',
    database: 'nome_do_banco',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  test: {
    username: 'root',
    password: 'senha-root',
    database: 'digital_store_test',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
};