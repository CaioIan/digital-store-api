const ListUserOrdersService = require("../../core/services/list-user-orders.service");
const ListUserOrdersResponseDto = require("../dto/list-user-orders.response.dto");

/**
 * @swagger
 * /v1/orders:
 *   get:
 *     summary: Lista os pedidos do usuário autenticado
 *     description: Retorna uma lista paginada de todos os pedidos realizados pelo usuário logado.
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Lista de pedidos retornada com sucesso
 *       401:
 *         description: Não autenticado
 */
class ListUserOrdersController {
  /**
   * Manipula a requisição HTTP GET para buscar os pedidos.
   * @param {import('express').Request} req - Objeto de Request do Express
   * @param {import('express').Response} res - Objeto de Response do Express
   */
  async handle(req, res) {
    // req.user é populado pelo auth-verification.middleware
    const userId = req.user.sub;
    const { limit, page } = req.query;

    const result = await ListUserOrdersService.execute(userId, limit, page);

    const dto = {
      data: ListUserOrdersResponseDto.fromDomain(result.data),
      total: result.total,
      limit: result.limit,
      page: result.page,
    };

    return res.status(200).json(dto);
  }
}

module.exports = new ListUserOrdersController();
