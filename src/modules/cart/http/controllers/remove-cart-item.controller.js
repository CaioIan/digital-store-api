const RemoveCartItemService = require("../../core/services/remove-cart-item.service");

/**
 * Controller responsável por remover um item do carrinho.
 * Extrai o userId do token JWT e delega ao serviço.
 */
class RemoveCartItemController {
  /**
   * Processa a requisição DELETE /v1/cart/remove/:itemId.
   * @param {import('express').Request} req - Objeto de requisição Express.
   * @param {import('express').Response} res - Objeto de resposta Express.
   * @returns {Promise<void>} Resposta 204 No Content.
   */
  async handle(req, res) {
    const userId = req.user.sub;
    const { itemId } = req.params;
    await RemoveCartItemService.execute(userId, itemId);
    return res.status(204).send();
  }
}

module.exports = new RemoveCartItemController();
