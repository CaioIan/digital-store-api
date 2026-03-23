const RemoveCartItemService = require("../../core/services/remove-cart-item.service");

/**
 * @swagger
 * /v1/cart/remove/{itemId}:
 *   delete:
 *     summary: Remove um item do carrinho
 *     description: Remove um item específico do carrinho do usuário autenticado.
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
 *         description: ID do item do carrinho a ser removido
 *     responses:
 *       204:
 *         description: Item removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (o item não pertence ao usuário)
 *       404:
 *         description: Item não encontrado
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
