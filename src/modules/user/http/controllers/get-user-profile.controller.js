const GetUserProfileService = require("../../core/services/get-user-profile.service");
const GetUserProfileResponseDto = require("../dto/response/get-user-profile.response.dto");

/**
 * @swagger
 * /v1/user/profile:
 *   get:
 *     summary: Busca o perfil do usuário logado
 *     description: Retorna os dados completos do usuário autenticado, incluindo endereço.
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
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
 *                 addresses:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Não autenticado
 */
class GetUserProfileController {
  async handle(req, res) {
    const userId = req.user.sub;

    const user = await GetUserProfileService.execute(userId);

    const dto = GetUserProfileResponseDto.fromDomain(user);

    return res.status(200).json(dto);
  }
}

module.exports = new GetUserProfileController();
