const ListAllUsersService = require("../../core/services/list-all-users.service");
const ListUsersResponseDto = require("../dto/list-users.response.dto");

/**
 * Controller para listagem global de usuários (Restrito ao ADMIN).
 */
class AdminListUsersController {
  /**
   * Manipula a requisição HTTP GET para buscar todos os usuários.
   * @param {import('express').Request} req - Objeto de Request do Express
   * @param {import('express').Response} res - Objeto de Response do Express
   */
  async handle(req, res) {
    const { limit, page } = req.query;

    const result = await ListAllUsersService.execute({ limit, page });

    const dto = {
      data: ListUsersResponseDto.fromDomain(result.data),
      total: result.total,
      limit: result.limit,
      page: result.page,
    };

    return res.status(200).json(dto);
  }
}

module.exports = new AdminListUsersController();
