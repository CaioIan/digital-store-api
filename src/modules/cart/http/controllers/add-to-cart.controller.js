const AddToCartService = require("../../core/services/add-to-cart.service");

/**
 * @swagger
 * /v1/cart/add:
 *   post:
 *     summary: Adiciona um produto ao carrinho
 *     description: |
 *       - Adiciona um novo item ao carrinho do usuário autenticado.
 *       - Se o item (mesma combinação de produto, cor e tamanho) já existir, soma a quantidade.
 *       - Requer autenticação via Bearer Token JWT.
 *     tags:
 *       - Carrinho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: string
 *                 example: 3c624be9-ecb6-4c4f-9e76-8cc0455799c7
 *               quantity:
 *                 type: integer
 *                 example: 1
 *               selected_color:
 *                 type: string
 *                 example: "Vermelho"
 *               selected_size:
 *                 type: string
 *                 example: "42"
 *     responses:
 *       201:
 *         description: Item adicionado com sucesso
 *       400:
 *         description: Dados inválidos ou produto desabilitado
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Produto não encontrado
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
