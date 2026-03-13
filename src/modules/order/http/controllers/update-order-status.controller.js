const UpdateOrderStatusService = require("../../core/services/update-order-status.service");
const ListUserOrdersResponseDto = require("../dto/list-user-orders.response.dto");

/**
 * Controller para atualização de status de pedidos (Restrito ao ADMIN).
 */
class UpdateOrderStatusController {
  /**
   * Manipula a requisição HTTP PATCH para alterar o status de um pedido.
   * @param {import('express').Request} req - Objeto de Request do Express
   * @param {import('express').Response} res - Objeto de Response do Express
   */
  async handle(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await UpdateOrderStatusService.execute(id, status);

    const dto = {
      message: "Status do pedido atualizado com sucesso.",
      data: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        updated_at: updatedOrder.updatedAt
      }
    };

    return res.status(200).json(dto);
  }
}

module.exports = new UpdateOrderStatusController();
