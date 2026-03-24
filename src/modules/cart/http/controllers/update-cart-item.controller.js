const UpdateCartItemService = require("../../core/services/update-cart-item.service");

/**
 * Controller responsável por atualizar a quantidade de um item no carrinho.
 * Extrai o userId do token JWT e delega ao serviço.
 */
class UpdateCartItemController {
  /**
   * Processa a requisição PUT /v1/cart/update/:itemId.
   * @param {import('express').Request} req - Objeto de requisição Express.
   * @param {import('express').Response} res - Objeto de resposta Express.
   * @returns {Promise<void>} Resposta JSON com o item atualizado (200).
   */
  async handle(req, res) {
    const userId = req.user.sub;
    const { itemId } = req.params;
    const { quantity } = req.body;
    const item = await UpdateCartItemService.execute(userId, itemId, quantity);
    return res.status(200).json(item);
  }
}

module.exports = new UpdateCartItemController();
