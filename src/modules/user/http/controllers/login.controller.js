const LoginResponseDto = require("../dto/response/login.response.dto")
/**
 * @swagger
 * /v1/user/login:
 *   post:
 *     summary: Autentica um usuário e retorna um token JWT
 *     tags:
 *       - Usuários
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: suaSenha123
 *     responses:
 *       200:
 *         description: Autenticação bem-sucedida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT de acesso
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstname:
 *                       type: string
 *                     surname:
 *                       type: string
 *                     email:
 *                       type: string
 *
 *       400:
 *         description: Erro de autenticação ou validação
 */
const LoginService = require("../../core/services/login.service");

class LoginController {
  async handle(req, res) {
    try {
      const { email, password } = req.body;

      const result = await LoginService.execute({ email, password });
      return res.status(200).json(LoginResponseDto.toResponse(result));
      
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new LoginController();
