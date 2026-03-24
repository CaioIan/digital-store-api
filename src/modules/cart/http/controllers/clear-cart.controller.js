const ClearCartService = require("../../core/services/clear-cart.service");

/**
 * Controller responsável por limpar todos os itens do carrinho.
 * Extrai o userId do token JWT e delega ao serviço.
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
