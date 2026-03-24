const LoginResponseDto = require("../dto/response/login.response.dto");
const AdminLoginService = require("../../core/services/admin-login.service");

/**
 * @swagger
 * /v1/admin/login:
 *   post:
 *     summary: Autentica um administrador e inicia sessão no painel admin
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
 *                 example: admin@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: adminSenha123
 *     responses:
 *       200:
 *         description: Autenticação administrativa bem-sucedida
 *       401:
 *         description: Credenciais inválidas
 *       403:
 *         description: Usuário sem permissão de ADMIN
 *       400:
 *         description: Erro de validação dos campos
 */

/**
 * Controller responsável por autenticação no painel administrativo.
 * Delega a validação de credenciais ao AdminLoginService.
 */
class AdminLoginController {
  /**
   * Processa requisições POST /v1/admin/login.
   * @param {import('express').Request} req - Objeto de requisição do Express.
   * @param {import('express').Response} res - Objeto de resposta do Express.
   * @returns {Promise<void>}
   */
  async handle(req, res) {
    const { email, password } = req.body;

    const result = await AdminLoginService.execute({ email, password });

    res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 24 horas
    });

    return res.status(200).json(LoginResponseDto.toResponse(result));
  }
}

module.exports = new AdminLoginController();
