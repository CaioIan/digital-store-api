const UpdateOrderStatusService = require("../../core/services/update-order-status.service");
const ListUserOrdersResponseDto = require("../dto/list-user-orders.response.dto");

/**
 * @swagger
 * /v1/admin/orders/{id}/status:
 *   patch:
 *     summary: Atualiza o status de um pedido (Admin)
 *     description: 'Permite alterar o status de um pedido (ex: "PAGO", "CANCELADO", "ENTREGUE"). Requer privilégios de ADMIN.'
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: "PAGO"
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Pedido não encontrado
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
