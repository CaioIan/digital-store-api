const AddToCartService = require("../../core/services/add-to-cart.service");

/**
 * Controller responsável por adicionar produtos ao carrinho.
 * Extrai o userId do token JWT e delega ao serviço.
 */
class AddToCartController {
  /**
   * Processa a requisição POST /v1/cart/add.
   * @param {import('express').Request} req - Objeto de requisição Express.
   * @param {import('express').Response} res - Objeto de resposta Express.
   * @returns {Promise<void>} Resposta JSON com o item adicionado/atualizado (201).
   */
  async handle(req, res) {
    const userId = req.user.sub;
    const item = await AddToCartService.execute(userId, req.body);
    return res.status(201).json(item);
  }
}

module.exports = new AddToCartController();
