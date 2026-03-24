/**
 * @swagger
 * /v1/category/search:
 *   get:
 *     summary: Busca categorias com filtros e paginação
 *     description: |
 *       - Retorna uma lista paginada de categorias.
 *       - É possível filtrar por campos específicos e pelo uso no menu.
 *       - É necessário autenticação via Bearer Token JWT.
 *     tags:
 *       - Categorias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Número de itens por página. Use -1 para retornar todos.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Número da página.
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: 'Campos a serem retornados, separados por vírgula (ex: "name,slug").'
 *       - in: query
 *         name: use_in_menu
 *         schema:
 *           type: string
 *           enum:
 *             - "true"
 *         description: Filtra categorias que são exibidas no menu.
 *     responses:
 *       200:
 *         description: Lista de categorias retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       use_in_menu:
 *                         type: boolean
 *                 total:
 *                   type: integer
 *                   description: Total de categorias encontradas
 *                 limit:
 *                   type: integer
 *                   description: Limite de itens por página
 *                 page:
 *                   type: integer
 *                   description: Página atual
 *       400:
 *         description: Parâmetros de consulta inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 */
const SearchCategoryService = require("../../core/services/search-category.service");
const SearchCategoryResponseDto = require("../dto/response/search-category.response.dto");

/**
 * Controller responsável pela busca paginada de categorias.
 * Recebe a requisição HTTP e delega ao serviço de busca.
 */
class SearchCategoryController {
  /**
   * Processa a requisição de busca de categorias com filtros e paginação.
   * @param {import('express').Request} req - Objeto de requisição Express (query validada).
   * @param {import('express').Response} res - Objeto de resposta Express.
   * @returns {Promise<void>} Resposta JSON com lista paginada de categorias (200).
   */
  async handle(req, res) {
    const result = await SearchCategoryService.execute(req.query);
    return res.status(200).json(SearchCategoryResponseDto.toResponse(result));
  }
}

module.exports = new SearchCategoryController();
