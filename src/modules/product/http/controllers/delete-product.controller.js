const DeleteProductService = require("../../core/services/delete-product.service");

/**
 * @swagger
 * /v1/product/{id}:
 *   delete:
 *     summary: Remove um produto
 *     tags:
 *       - Produtos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       204:
 *         description: Produto removido com sucesso
 *       404:
 *         description: Produto não encontrado
 *       400:
 *         description: Erro ao remover produto
 */
class DeleteProductController {
    async handle(req, res) {

        try {
            const targetProductId = req.params.id;

            await DeleteProductService.execute(targetProductId);

            return res.status(204).send();
        } catch (error) {
             if (error.message === 'Product not found') {
                return res.status(404).json({ error: error.message });
            }
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new DeleteProductController();