const { z } = require("zod");

// Definição do Schema para criação de categoria
const createCategorySchema = z
  .object({
    name: z.string({ required_error: "Name is required" }).min(1, "Name is required").max(50, "Name must be at most 50 characters"),
    slug: z.string({ required_error: "Slug is required" }).min(1, "Slug is required").max(50, "Slug must be at most 50 characters"),
    use_in_menu: z.boolean().optional(),
  })
  .strict();

// Middleware para usar na rota
const createCategoryValidator = (req, res, next) => {
  const result = createCategorySchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }
  next();
};

module.exports = { createCategoryValidator };
