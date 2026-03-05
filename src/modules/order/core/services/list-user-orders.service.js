const OrderRepository = require("../../persistence/order.repository");

/**
 * Serviço responsável por listar todos os pedidos de um usuário.
 */
class ListUserOrdersService {
  /**
   * Retorna todos os pedidos do usuário autenticado com paginação.
   * @param {string} userId - UUID do usuário logado.
   * @param {string} [limit] - Limite de itens
   * @param {string} [page] - Página atual
   * @returns {Promise<Object>} Resultado paginado.
   */

  async execute(userId, limit, page) {
    const result = await OrderRepository.findAllByUser(userId, { limit, page });
    return result;
  }
}

module.exports = new ListUserOrdersService();
