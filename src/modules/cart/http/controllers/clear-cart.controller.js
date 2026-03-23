const ClearCartService = require("../../core/services/clear-cart.service");

/**
 * @swagger
 * /v1/cart/clear:
 *   delete:
 *     summary: Limpa todo o carrinho do usuário
 *     description: Remove permanentemente todos os itens do carrinho do usuário autenticado.
 *     tags:
 *       - Carrinho
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Carrinho limpo com sucesso
 *       401:
 *         description: Não autenticado
 */
class ClearCartController {
  /**
   * Processa a requisição DELETE /v1/cart/clear.
   * @param {import('express').Request} req - Objeto de requisição Express.
   * @param {import('express').Response} res - Objeto de resposta Express.
   * @returns {Promise<void>} Resposta 204 No Content.
   */
  async handle(req, res) {
    const userId = req.user.sub;
    await ClearCartService.execute(userId);
    return res.status(204).send();
  }
}

module.exports = new ClearCartController();
