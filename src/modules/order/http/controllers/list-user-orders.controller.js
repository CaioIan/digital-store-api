const ListUserOrdersService = require("../../core/services/list-user-orders.service");
const ListUserOrdersResponseDto = require("../dto/list-user-orders.response.dto");

/**
 * Controller para listagem de pedidos do usuário autenticado.
 * Recebe a requisição (com token validado) e extrai os parâmetros de paginação.
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
