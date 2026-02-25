// Helper para testes de integração - Configuração do banco de testes
const { sequelize, User, UserAddress } = require("../../src/models");

/**
 * Inicializa o banco de testes antes de executar os testes
 * Sincroniza os modelos User e UserAddress para os testes do módulo user
 */
async function setupTestDatabase() {
  try {
    await sequelize.authenticate();
    // Desabilita FK checks para permitir drop/recreate das tabelas com dependências
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
    await UserAddress.sync({ force: true });
    await User.sync({ force: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
  } catch (error) {
    console.error("Erro ao conectar ao banco de testes:", error);
    throw error;
  }
}

/**
 * Limpa todas as tabelas do banco de testes
 */
async function clearTestDatabase() {
  try {
    // Desabilita FK checks para limpar dados mesmo com foreign keys
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
    await UserAddress.destroy({ where: {}, truncate: true, force: true });
    await User.destroy({ where: {}, truncate: true, force: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
  } catch (error) {
    // Se a tabela não existir, ignora o erro
    if (error.original?.code !== "ER_NO_SUCH_TABLE") {
      console.error("Erro ao limpar banco de testes:", error);
      throw error;
    }
  }
}

/**
 * Fecha a conexão com o banco de testes
 */
async function closeTestDatabase() {
  try {
    await sequelize.close();
  } catch (error) {
    console.error("Erro ao fechar conexão com banco de testes:", error);
    throw error;
  }
}

/**
 * Cria um usuário de teste no banco
 */
async function createTestUser(userData = {}) {
  const defaultData = {
    firstname: "Test",
    surname: "user",
    cpf: `000${Date.now().toString().slice(-8)}`,
    phone: `119${Date.now().toString().slice(-8)}`,
    email: `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    password: "password123",
    role: "USER",
  };

  return await User.create({ ...defaultData, ...userData });
}

/**
 * Cria um usuário admin de teste no banco
 */
async function createTestAdmin(userData = {}) {
  const defaultData = {
    firstname: "Admin",
    surname: "user",
    cpf: `999${Date.now().toString().slice(-8)}`,
    phone: `119${Date.now().toString().slice(-8)}`,
    email: `admin-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    password: "admin123",
    role: "ADMIN",
  };

  return await User.create({ ...defaultData, ...userData });
}

module.exports = {
  setupTestDatabase,
  clearTestDatabase,
  closeTestDatabase,
  createTestUser,
  createTestAdmin,
  sequelize,
  User,
  UserAddress,
};

