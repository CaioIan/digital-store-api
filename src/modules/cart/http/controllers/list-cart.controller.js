const ListCartService = require("../../core/services/list-cart.service");
const ListCartResponseDto = require("../dto/response/list-cart.response.dto");

/**
 * @swagger
 * /v1/cart:
 *   get:
 *     summary: Lista os itens do carrinho
 *     description: Retorna todos os itens presentes no carrinho do usuário autenticado.
 *     tags:
 *       - Carrinho
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho retornado com sucesso
 *       401:
 *         description: Não autenticado
 */
class ListCartController {
  /**
   * Processa a requisição GET /v1/cart.
   * @param {import('express').Request} req - Objeto de requisição Express.
   * @param {import('express').Response} res - Objeto de resposta Express.
   * @returns {Promise<void>} Resposta JSON com os itens do carrinho (200).
   */
  async handle(req, res) {
    const userId = req.user.sub;
    const result = await ListCartService.execute(userId);
    return res.status(200).json(ListCartResponseDto.toResponse(result));
  }
}

module.exports = new ListCartController();
