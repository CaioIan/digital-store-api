const ListAllOrdersService = require("../../core/services/admin-list-orders.service");
const ListUserOrdersResponseDto = require("../dto/list-user-orders.response.dto");

/**
 * Controller para listagem de pedidos (Restrito ao ADMIN).
 * Pode listar todos os pedidos do sistema ou filtrar por um usuário específico via query string.
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
