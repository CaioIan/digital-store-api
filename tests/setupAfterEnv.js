// Setup que roda após o ambiente de teste estar pronto
// Fecha a conexão com o banco após todos os testes

afterAll(async () => {
  // Aguarda um pouco para garantir que todas as queries terminaram
  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    const { sequelize } = require("./helpers/test-database.helper");
    await sequelize.close();
  } catch (error) {
    // Ignora erros ao fechar a conexão
  }
});
