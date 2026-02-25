/**
 * @swagger
 * /v1/user/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     description: |
 *       - Apenas administradores podem buscar qualquer usuário.
 *       - Usuários comuns (USER) só podem buscar seus próprios dados.
 *       - É necessário autenticação via Bearer Token JWT.
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 firstname:
 *                   type: string
 *                 surname:
 *                   type: string
 *                 cpf:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *                 addresses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       endereco:
 *                         type: string
 *                       bairro:
 *                         type: string
 *                       cidade:
 *                         type: string
 *                       cep:
 *                         type: string
 *                       complemento:
 *                         type: string
 *                         nullable: true
 *       400:
 *         description: Erro ao buscar usuário
 *       403:
 *         description: Acesso negado ou recurso não disponível (usuário não existe ou permissão insuficiente)
 *       401:
 *         description: Token não fornecido ou inválido
 */
const GetUserByIdService = require("../../core/services/get-user-by-id.service");
const GetUserByIdResponseDto = require("../dto/response/get-user-by-id.response.dto");

/**
 * Controller responsável por processar requisições de busca de usuário por ID.
 * Delega a autorização e a busca ao GetUserByIdService.
 */
class GetUserByIdController {
  /**
   * Processa requisições GET /v1/user/:id.
   * @param {import('express').Request} req - Objeto de requisição do Express.
   * @param {import('express').Response} res - Objeto de resposta do Express.
   * @returns {Promise<void>}
   */
  async handle(req, res) {
    const targetUserId = req.params.id;
    const loggedUser = req.user;
    const user = await GetUserByIdService.execute({ targetUserId, loggedUser });
    return res.status(200).json(GetUserByIdResponseDto.toResponse(user));
  }
}

module.exports = new GetUserByIdController();
