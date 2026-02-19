const GetProductByIdService = require("../../core/services/get-product-by-id.service");
const GetProductByIdResponseDto = require("../dto/response/get-product-by-id.response.dto");

/**
 * @swagger
 * /v1/product/{id}:
 *   get:
 *     summary: Busca um produto pelo ID
 *     tags:
 *       - Produtos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       400:
 *         description: Erro ao buscar produto
 */
class GetProductByIdController {
    async handle(req, res) {
        try {
            const targetProductId = req.params.id;
            const product = await GetProductByIdService.execute(targetProductId);

            return res.status(200).json(GetProductByIdResponseDto.toResponse(product));
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new GetProductByIdController();