
const CreateUserService = require('../../core/services/create-user.service');

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
 *               - email
 *               - password
 *               - confirmPassword
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
 *                 email:
 *                   type: string
 *                   example: joao@email.com
 *                 format: password
 *                 example: senha123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: senha123
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
 *                   example: 1
 *                 firstname:
 *                   type: string
 *                   example: João
 *                 surname:
 *                   type: string
 *                   example: Silva
 *                 email:
 *                   type: string
 *                   example: joao@email.com
 *       400:
 *         description: Dados inválidos ou senhas não conferem
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Passwords do not match
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
 *                         example: Invalid email
 */
class CreateUserController {
  async handle(req, res) {
    try {
      const user = await CreateUserService.execute(req.body);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CreateUserController();
