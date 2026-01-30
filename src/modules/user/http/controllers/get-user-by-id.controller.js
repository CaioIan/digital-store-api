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
 *                 email:
 *                   type: string
 *       400:
 *         description: Erro ao buscar usuário
 *       403:
 *         description: Acesso negado ou recurso não disponível (usuário não existe ou permissão insuficiente)
 *       401:
 *         description: Token não fornecido ou inválido
 */
const GetUserByIdService = require("../../core/services/get-user-by-id.service");

class GetUserByIdController {
  async handle(req, res) {
    try {
      const targetUserId = req.params.id;
      const loggedUser = req.user; // payload do token
      const user = await GetUserByIdService.execute({ targetUserId, loggedUser });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new GetUserByIdController();
