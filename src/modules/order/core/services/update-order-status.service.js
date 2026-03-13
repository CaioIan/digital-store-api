const OrderRepository = require("../../persistence/order.repository");
const AppError = require("../../../../shared/errors/app-error");

/**
 * Serviço responsável por atualizar o status de um pedido.
 * Apenas administradores podem realizar esta operação.
 */
class UpdateOrderStatusService {
  /**
   * Atualiza o status de um pedido após validar se o novo status é permitido.
   * @param {string} orderId - UUID do pedido.
   * @param {string} newStatus - Novo status (pending, completed, cancelled, shipped, delivered).
   * @returns {Promise<Object>} O pedido atualizado.
   */
  async execute(orderId, newStatus) {
    const allowedStatus = ["pending", "completed", "cancelled", "shipped", "delivered"];

    if (!allowedStatus.includes(newStatus)) {
      throw new AppError(`Status '${newStatus}' é inválido.`, 400);
    }

    const order = await OrderRepository.updateStatus(orderId, newStatus);
    
    if (!order) {
      throw new AppError("Pedido não encontrado.", 404);
    }

    return order;
  }
}

module.exports = new UpdateOrderStatusService();
