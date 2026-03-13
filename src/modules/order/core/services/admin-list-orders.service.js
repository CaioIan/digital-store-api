const OrderRepository = require("../../persistence/order.repository");

/**
 * Serviço responsável por listar pedidos para o administrador.
 * Pode retornar todos os pedidos do sistema ou filtrados por um usuário específico.
 */
class ListAllOrdersService {
  /**
   * Retorna os pedidos com paginação.
   * @param {Object} options - Opções de busca.
   * @param {string} [options.userId] - Opcional: UUID de um usuário específico.
   * @param {string} [options.limit] - Limite de itens.
   * @param {string} [options.page] - Página atual.
   * @returns {Promise<Object>} Resultado paginado.
   */
  async execute({ userId, limit, page } = {}) {
    const result = await OrderRepository.findAll({ userId, limit, page });
    return result;
  }
}

module.exports = new ListAllOrdersService();
