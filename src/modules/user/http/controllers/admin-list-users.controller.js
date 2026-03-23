const ListAllUsersService = require("../../core/services/list-all-users.service");
const ListUsersResponseDto = require("../dto/list-users.response.dto");

/**
 * @swagger
 * /v1/admin/users:
 *   get:
 *     summary: Lista todos os usuários do sistema (Admin)
 *     description: Retorna uma lista paginada de todos os usuários. Requer privilégios de ADMIN.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *         description: Quantidade de registros por página
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       firstname:
 *                         type: string
 *                       surname:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 page:
 *                   type: integer
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
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
