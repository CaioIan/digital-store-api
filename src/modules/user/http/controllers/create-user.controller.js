const CreateUserService = require("../../core/services/create-user.service");
const CreateUserResponseDto = require("../dto/response/create-user.response.dto");

/**
 * @swagger
 * /v1/user:
 *   post:
 *     summary: Cria um novo usuário
 *     tags:
 *       - Usuários
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - surname
 *               - cpf
 *               - phone
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: João
 *               surname:
 *                 type: string
 *                 example: Silva
 *               cpf:
 *                 type: string
 *                 example: "12345678901"
 *               phone:
 *                 type: string
 *                 example: "11999990001"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: senha123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: senha123
 *               endereco:
 *                 type: string
 *                 description: "Endereço de entrega (obrigatório se qualquer campo de endereço for enviado)"
 *                 example: "Rua Exemplo, 123"
 *               bairro:
 *                 type: string
 *                 description: "Bairro (obrigatório se qualquer campo de endereço for enviado)"
 *                 example: Centro
 *               cidade:
 *                 type: string
 *                 description: "Cidade (obrigatório se qualquer campo de endereço for enviado)"
 *                 example: São Paulo
 *               cep:
 *                 type: string
 *                 description: "CEP (obrigatório se qualquer campo de endereço for enviado)"
 *                 example: "01001000"
 *               complemento:
 *                 type: string
 *                 description: "Complemento do endereço (sempre opcional)"
 *                 example: Apto 42
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: deca6d22-1b83-4048-9a91-b86210596df7
 *                 firstname:
 *                   type: string
 *                   example: João
 *                 surname:
 *                   type: string
 *                   example: Silva
 *                 cpf:
 *                   type: string
 *                   example: "12345678901"
 *                 phone:
 *                   type: string
 *                   example: "11999990001"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: joao@email.com
 *                 addresses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       endereco:
 *                         type: string
 *                         example: "Rua Exemplo, 123"
 *                       bairro:
 *                         type: string
 *                         example: Centro
 *                       cidade:
 *                         type: string
 *                         example: São Paulo
 *                       cep:
 *                         type: string
 *                         example: "01001000"
 *                       complemento:
 *                         type: string
 *                         nullable: true
 *                         example: Apto 42
 *       400:
 *         description: Dados inválidos ou senhas não conferem
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: As senhas não coincidem
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: email
 *                       message:
 *                         type: string
 *                         example: Email inválido
 */

/**
 * Controller responsável por processar requisições de criação de usuário.
 * Delega a lógica de negócio ao CreateUserService e formata a resposta via DTO.
 */
class CreateUserController {
  /**
   * Processa requisições POST /v1/user.
   * @param {import('express').Request} req - Objeto de requisição do Express.
   * @param {import('express').Response} res - Objeto de resposta do Express.
   * @returns {Promise<void>}
   */
  async handle(req, res) {
    const user = await CreateUserService.execute(req.body);
    return res.status(201).json(CreateUserResponseDto.toResponse(user));
  }
}

module.exports = new CreateUserController();
