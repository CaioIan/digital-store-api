const CreateOrderService = require("../../core/services/create-order.service");

/**
 * @swagger
 * /v1/orders:
 *   post:
 *     summary: Finaliza o checkout e cria um pedido
 *     description: Converte o carrinho atual do usuário em um pedido imutável.
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personal_info
 *               - delivery_address
 *               - payment
 *             properties:
 *               personal_info:
 *                 type: object
 *               delivery_address:
 *                 type: object
 *               payment:
 *                 type: object
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       401:
 *         description: Não autenticado
 *       400:
 *         description: Erro na criação do pedido (estoque insuficiente, carrinho vazio, etc)
 */
class CreateOrderController {
  async handle(req, res) {
    // Controller lida com input/output via HTTP
    const userId = req.user.sub;
    const { personal_info, delivery_address, payment } = req.body;

    const { order_id } = await CreateOrderService.execute({
      user_id: userId,
      personal_info,
      delivery_address,
      payment,
    });

    return res.status(201).json({
      message: "Pedido criado com sucesso",
      order_id,
    });
  }
}

module.exports = new CreateOrderController();
