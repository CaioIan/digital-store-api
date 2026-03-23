const GetOrderByIdService = require("../../core/services/get-order-by-id.service");
const GetOrderByIdResponseDto = require("../dto/get-order-by-id.response.dto");

/**
 * @swagger
 * /v1/orders/{id}:
 *   get:
 *     summary: Busca detalhes de um pedido específico
 *     description: Retorna os dados completos de um pedido, incluindo itens, endereço de entrega e informações de pagamento.
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Detalhes do pedido retornados com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (o pedido não pertence ao usuário e ele não é admin)
 *       404:
 *         description: Pedido não encontrado
 */
class GetOrderByIdController {
  async handle(req, res) {
    const orderId = req.params.id;
    const userId = req.user.sub;

    const order = await GetOrderByIdService.execute(orderId, userId);

    const dto = GetOrderByIdResponseDto.fromDomain(order);

    return res.status(200).json(dto);
  }
}

module.exports = new GetOrderByIdController();
