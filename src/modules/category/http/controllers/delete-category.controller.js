/**
 * @swagger
 * /v1/category/{id}:
 *   delete:
 *     summary: Deleta uma categoria pelo ID (soft delete)
 *     description: |
 *       - Realiza o soft delete de uma categoria existente (preenche o campo deleted_at).
 *       - É necessário autenticação via Bearer Token JWT.
 *       - Apenas usuários com role ADMIN podem deletar categorias.
 *       - A categoria não é removida do banco, apenas marcada como deletada.
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
 *         description: Categoria deletada com sucesso
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
 *         description: Erro de validação (ID inválido) ou categoria não encontrada
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Acesso negado (usuário não é ADMIN)
 */
const DeleteCategoryService = require("../../core/services/delete-category.service")
const DeleteCategoryResponseDto = require("../dto/response/delete-category.response.dto")

class DeleteCategoryController {
    async handle(req, res) {
        try {
            const targetCategoryId = req.params.id;
            const deletedCategory = await DeleteCategoryService.execute(targetCategoryId);

            return res.status(200).json(DeleteCategoryResponseDto.toResponse(deletedCategory));
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new DeleteCategoryController();