/**
 * @swagger
 * /v1/user/logout:
 *   post:
 *     summary: Encerra a sessão do usuário (Logout)
 *     tags:
 *       - Usuários
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
class LogoutController {
  /**
   * Processa requisições POST /v1/user/logout.
   * Limpa o cookie HTTP-Only com o token JWT.
   * @param {import('express').Request} req - Objeto de requisição do Express.
   * @param {import('express').Response} res - Objeto de resposta do Express.
   */
  async handle(req, res) {
    res.clearCookie("access_token");
    return res.status(200).json({ message: "Logout realizado com sucesso" });
  }
}

module.exports = new LogoutController();
