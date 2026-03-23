const UpdateUserAddressService = require("../../core/services/update-user-address.service");
const UpdateUserAddressResponseDto = require("../dto/response/update-user-address.response.dto");

/**
 * @swagger
 * /v1/user/address:
 *   put:
 *     summary: Atualiza o endereço do usuário logado
 *     description: Cria ou atualiza o endereço de entrega associado ao usuário autenticado.
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endereco
 *               - bairro
 *               - cidade
 *               - cep
 *             properties:
 *               endereco:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *               cep:
 *                 type: string
 *               complemento:
 *                 type: string
 *     responses:
 *       200:
 *         description: Endereço atualizado com sucesso
 *       401:
 *         description: Não autenticado
 *       400:
 *         description: Dados inválidos
 */
class UpdateUserAddressController {
  async handle(req, res) {
    const userId = req.user.sub;

    const updatedUser = await UpdateUserAddressService.execute(userId, req.body);

    const dto = UpdateUserAddressResponseDto.fromDomain(updatedUser);

    return res.status(200).json(dto);
  }
}

module.exports = new UpdateUserAddressController();
