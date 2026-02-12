/**
 * @swagger
 * /v1/category/{id}:
 *   get:
 *     summary: Busca uma categoria pelo ID
 *     description: |
 *       - Retorna os dados de uma categoria específica.
 *       - É necessário autenticação via Bearer Token JWT.
 *     tags:
 *       - Categorias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da categoria (UUID)
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 slug:
 *                   type: string
 *                 use_in_menu:
 *                   type: boolean
 *       400:
 *         description: ID inválido (não é um UUID válido)
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Categoria não encontrada
 */
const GetCategoryByIdService = require("../../core/services/get-category-by-id.service");
const GetCategoryByIdResponseDto = require("../dto/response/get-category-by-id.response.dto");

class GetCategoryByIdController {
  async handle(req, res) {
    try {
      const targetCategoryId = req.params.id;
      const category = await GetCategoryByIdService.execute(targetCategoryId);
      return res.status(200).json(GetCategoryByIdResponseDto.toResponse(category));
    } catch (error) {
      if (error.message === "Category not found.") {
        return res.status(404).json({ error: "Category not found" });
      }
      return res.status(400).json({ error: error.message });
    }
  }
}
module.exports = new GetCategoryByIdController();
