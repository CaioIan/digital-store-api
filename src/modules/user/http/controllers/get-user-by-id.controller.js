/**
 * @swagger
 * /v1/user/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags:
 *       - Usuários
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
 */
const GetUserByIdService = require("../../core/services/get-user-by-id.service");

class GetUserByIdController {
  async handle(req, res) {
    try {
      const userId = req.params.id;
      const user = await GetUserByIdService.execute({ userId });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new GetUserByIdController();
