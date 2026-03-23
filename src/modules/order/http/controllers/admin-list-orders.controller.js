const ListAllOrdersService = require("../../core/services/admin-list-orders.service");
const ListUserOrdersResponseDto = require("../dto/list-user-orders.response.dto");

/**
 * @swagger
 * /v1/admin/orders:
 *   get:
 *     summary: Lista todos os pedidos do sistema (Admin)
 *     description: Retorna uma lista paginada de todos os pedidos. Permite filtrar por um usuário específico.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Opcional. ID do usuário para filtrar os pedidos.
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
 *       403:
 *         description: Acesso negado
 */
class AdminListOrdersController {
  /**
   * Manipula a requisição HTTP GET para buscar os pedidos.
   * @param {import('express').Request} req - Objeto de Request do Express
   * @param {import('express').Response} res - Objeto de Response do Express
   */
  async handle(req, res) {
    const { userId, limit, page } = req.query;

    const result = await ListAllOrdersService.execute({ userId, limit, page });

    const dto = {
      data: ListUserOrdersResponseDto.fromDomain(result.data),
      total: result.total,
      limit: result.limit,
      page: result.page,
    };

    return res.status(200).json(dto);
  }
}

module.exports = new AdminListOrdersController();
