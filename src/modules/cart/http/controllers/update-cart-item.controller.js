const UpdateCartItemService = require("../../core/services/update-cart-item.service");

/**
 * @swagger
 * /v1/cart/update/{itemId}:
 *   put:
 *     summary: Atualiza a quantidade de um item no carrinho
 *     description: Altera a quantidade de um item específico no carrinho do usuário autenticado.
 *     tags:
 *       - Carrinho
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item do carrinho
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Quantidade atualizada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Item não encontrado
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
