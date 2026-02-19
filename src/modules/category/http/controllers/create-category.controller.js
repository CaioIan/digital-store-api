const CreateCategoryService = require("../../core/services/create-category.service");

/**
 * @swagger
 * /v1/category:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags:
 *       - Categorias
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               use_in_menu:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *       400:
 *         description: Erro de validação
 */
class CreateCategoryController {
  async handle(req, res) {
    try {
      const category = await CreateCategoryService.execute(req.body);
      return res.status(201).json(category);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CreateCategoryController();
