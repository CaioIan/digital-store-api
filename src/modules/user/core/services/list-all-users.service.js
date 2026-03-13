const UserRepository = require("../../persistence/user.repository");

/**
 * Serviço responsável por listar todos os usuários do sistema.
 */
class ListAllUsersService {
  /**
   * Executa a busca paginada de usuários.
   * @param {Object} params - Parâmetros de busca.
   * @param {number} params.limit - Limite de registros.
   * @param {number} params.page - Página atual.
   * @returns {Promise<Object>} Resultado da busca.
   */
  async execute({ limit, page }) {
    return await UserRepository.findAll({ limit, page });
  }
}

module.exports = new ListAllUsersService();
