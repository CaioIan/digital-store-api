// Helper para testes de integração - Configuração do banco de testes
const { sequelize, User } = require("../../src/models");

/**
 * Inicializa o banco de testes antes de executar os testes
 * Sincroniza apenas o modelo User para os testes do módulo user
 */
async function setupTestDatabase() {
  try {
    await sequelize.authenticate();
    // Sincroniza apenas o modelo User (force: true recria a tabela)
    await User.sync({ force: true });
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
    // Usa truncate com cascade para limpar dados mesmo com foreign keys
    await User.destroy({ where: {}, truncate: true, force: true });
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
    surname: "User",
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
    surname: "User",
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
};
