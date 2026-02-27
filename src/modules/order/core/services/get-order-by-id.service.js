const AppError = require("../../../../shared/errors/app-error");
const OrderRepository = require("../../persistence/order.repository");

/**
 * Serviço responsável por buscar os detalhes de um pedido.
 * Garante que somente o usuário dono do pedido pode acessá-lo.
 */
class GetOrderByIdService {
  /**
   * Retorna os detalhes consolidado de um Pedido
   * @param {Object} params
   * @param {string} params.targetOrderId - ID numérico ou UUID do pedido.
   * @param {string} params.loggedUserId - UUID do usuário logado (dono).
   * @returns {Promise<Object>}
   * @throws {AppError} Se o pedido não existir ou nao pertencer a ele.
   */
  async execute(targetOrderId, loggedUserId) {
    const order = await OrderRepository.findOrderByIdAndUser(targetOrderId, loggedUserId);

    if (!order) {
      throw new AppError("Pedido não encontrado ou você não tem permissão para acessá-lo.", 404);
    }

    return order;
  }
}

module.exports = new GetOrderByIdService();
