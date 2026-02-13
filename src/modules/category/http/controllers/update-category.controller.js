/**
 * @swagger
 * /v1/category/{id}:
 *   patch:
 *     summary: Atualiza uma categoria pelo ID
 *     description: |
 *       - Atualiza os dados de uma categoria existente.
 *       - É necessário autenticação via Bearer Token JWT.
 *       - Apenas usuários com role ADMIN podem atualizar categorias.
 *       - Todos os campos (name, slug, use_in_menu) são obrigatórios.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - use_in_menu
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: "Eletrônicos"
 *               slug:
 *                 type: string
 *                 minLength: 2
 *                 example: "eletronicos"
 *               use_in_menu:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
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
 *         description: Erro de validação ou categoria não encontrada
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Acesso negado (usuário não é ADMIN)
 */
const UpdateCategoryService = require("../../core/services/update-category.service");
const UpdateCategoryResponseDto = require("../dto/response/update-category.response.dto");

class UpdateCategoryController {
    async handle(req, res) {
        try {
            const targetCategoryId = req.params.id;
            const body = req.body;
            const updatedCategory = await UpdateCategoryService.execute(targetCategoryId, body);

            return res.json(UpdateCategoryResponseDto.toResponse(updatedCategory));
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new UpdateCategoryController();