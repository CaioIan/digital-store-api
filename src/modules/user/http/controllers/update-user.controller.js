const UpdateUserService = require("../../core/services/update-user.service");
const UpdateUserResponseDto = require("../dto/response/update-user.response.dto");

/**
 * @swagger
 * /v1/user/{id}:
 *   patch:
 *     summary: Atualiza os dados de um usuário
 *     description: Permite que o próprio usuário ou um ADMIN atualize os campos firstname e surname de um usuário.
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
 *         description: ID do usuário a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Novo nome"
 *               surname:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Novo sobrenome"
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
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
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Erro de validação ou acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * Controller responsável por processar requisições de atualização de perfil.
 * Delega a autorização e lógica de atualização ao UpdateUserService.
 */
class UpdateUserController {
  /**
   * Processa requisições PATCH /v1/user/:id.
   * @param {import('express').Request} req - Objeto de requisição do Express.
   * @param {import('express').Response} res - Objeto de resposta do Express.
   * @returns {Promise<void>}
   */
  async handle(req, res) {
    const targetUserId = req.params.id;
    const loggedUser = req.user;

    const user = await UpdateUserService.execute(targetUserId, loggedUser, req.body);
    return res.status(200).json(UpdateUserResponseDto.toResponse(user));
  }
}

module.exports = new UpdateUserController();
