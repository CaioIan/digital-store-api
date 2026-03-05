const SearchProductService = require("../../core/services/search-product.service");
const SearchProductResponseDto = require("../dto/response/search-product.response.dto");

/**
 * @swagger
 * /v1/product/search:
 *   get:
 *     summary: Busca produtos com filtros e paginação
 *     description: |
 *       - Retorna uma lista paginada de produtos com suas relações (imagens, opções, categorias).
 *       - Suporta filtros por nome/descrição, categorias, faixa de preço e opções.
 *       - Endpoint público (não requer autenticação).
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
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filtro exato de marca
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *         description: Filtro de gênero (Masculino, Feminino, Unisex)
 *       - in: query
 *         name: price-range
 *         schema:
 *           type: string
 *         description: Faixa de preço no formato "min-max"
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 *       400:
 *         description: Parâmetros de consulta inválidos
 */

/**
 * Controller responsável pela busca paginada de produtos.
 * Recebe a requisição HTTP com filtros e delega ao serviço de busca.
 */
class SearchProductController {
  /**
   * Processa a requisição de busca de produtos com filtros e paginação.
   * Os parâmetros validados podem estar em res.locals.searchParams ou req.query.
   * @param {import('express').Request} req - Objeto de requisição Express.
   * @param {import('express').Response} res - Objeto de resposta Express.
   * @returns {Promise<void>} Resposta JSON com lista paginada de produtos (200).
   */
  async handle(req, res) {
    const {
      page,
      limit,
      fields,
      match,
      brand,
      gender,
      category_ids,
      "price-range": priceRange,
      option,
    } = res.locals.searchParams || req.query;

    const result = await SearchProductService.execute({
      page,
      limit,
      fields,
      match,
      brand,
      gender,
      category_ids,
      priceRange,
      option,
    });

    return res.status(200).json(SearchProductResponseDto.toResponse(result));
  }
}

module.exports = new SearchProductController();
