const SearchProductService = require("../../core/services/search-product.service");
const SearchProductResponseDto = require("../dto/response/search-product.response.dto");

/**
 * @swagger
 * /v1/product/search:
 *   get:
 *     summary: Busca produtos com filtros
 *     tags:
 *       - Produtos
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Limite de itens por página (-1 para todos)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Campos a serem retornados, separados por vírgula
 *       - in: query
 *         name: match
 *         schema:
 *           type: string
 *         description: Termo de busca para nome ou descrição
 *       - in: query
 *         name: category_ids
 *         schema:
 *           type: string
 *         description: IDs das categorias separados por vírgula
 *       - in: query
 *         name: price-range
 *         schema:
 *           type: string
 *         description: Faixa de preço (min-max)
 *     responses:
 *       200:
 *         description: Lista de produtos encontrada
 *       400:
 *         description: Erro nos parâmetros de busca
 */
class SearchProductController {
  async handle(req, res) {
    try {
      const { 
        page, 
        limit, 
        fields, 
        match, 
        category_ids, 
        "price-range": priceRange, 
        option 
      } = res.locals.searchParams || req.query;

      const result = await SearchProductService.execute({
        page,
        limit,
        fields,
        match,
        category_ids,
        priceRange,
        option,
      });

      return res.status(200).json(SearchProductResponseDto.toResponse(result));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SearchProductController();