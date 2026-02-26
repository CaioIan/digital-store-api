const LoginResponseDto = require("../dto/response/login.response.dto");

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
 *                     cpf:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *
 *       400:
 *         description: Erro de autenticação ou validação
 */
const LoginService = require("../../core/services/login.service");

/**
 * Controller responsável por processar requisições de autenticação.
 * Delega a validação de credenciais e geração de token ao LoginService.
 */
class LoginController {
  /**
   * Processa requisições POST /v1/user/login.
   * @param {import('express').Request} req - Objeto de requisição do Express.
   * @param {import('express').Response} res - Objeto de resposta do Express.
   * @returns {Promise<void>}
   */
  async handle(req, res) {
    const { email, password } = req.body;

    const result = await LoginService.execute({ email, password });

    res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 24 horas
    });

    return res.status(200).json(LoginResponseDto.toResponse(result));
  }
}

module.exports = new LoginController();
