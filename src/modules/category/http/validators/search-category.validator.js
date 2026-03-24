const { z } = require("zod");

/**
 * Schema Zod de validação para busca paginada de categorias.
 * Valida e transforma os parâmetros de query string.
 * @type {import('zod').ZodObject}
 */
const searchCategorySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .default(12)
    .refine((val) => val === -1 || val > 0, {
      message: "Limite deve ser positivo ou -1",
    }),

  page: z.coerce.number().int().min(1).default(1),

  // Transforma "name,slug" em ["name", "slug"]
  fields: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean)
        : undefined,
    ),

  use_in_menu: z
    .enum(["true"])
    .optional()
    .transform((val) => (val === "true" ? true : undefined)),
});

/**
 * Middleware Express que valida os query params contra o searchCategorySchema.
 * Os dados validados e transformados são reescritos em req.query antes de continuar.
 * Retorna 400 com erros por campo se a validação falhar.
 * @param {import('express').Request} req - Objeto de requisição do Express.
 * @param {import('express').Response} res - Objeto de resposta do Express.
 * @param {import('express').NextFunction} next - Função next do Express.
 */
const searchCategoryValidator = (req, res, next) => {
  const result = searchCategorySchema.safeParse(req.query);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }

  req.query = result.data;
  next();
};

module.exports = { searchCategoryValidator };
