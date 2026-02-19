const UpdateProductService = require("../../core/services/update-product.service");

/**
 * @swagger
 * /v1/product/{id}:
 *   patch:
 *     summary: Atualiza um produto
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               use_in_menu:
 *                 type: boolean
 *               stock:
 *                 type: integer
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               price_with_discount:
 *                 type: number
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     content:
 *                       type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     shape:
 *                       type: string
 *                       enum: [square, circle]
 *                     radius:
 *                       type: integer
 *                     type:
 *                       type: string
 *                       enum: [text, color]
 *                     values:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       400:
 *         description: Erro de validação
 */
class UpdateProductController {
    async handle(req, res) {

        try {
            const targetProductId = req.params.id;
            const body = req.body;

            const updatedProduct = await UpdateProductService.execute(targetProductId, body);
            return res.status(200).json(updatedProduct);
            
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }

    }
}

module.exports = new UpdateProductController();