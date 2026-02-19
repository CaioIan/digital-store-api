const { z } = require("zod");

// Definição do Schema para atualização de categoria
const updateCategorySchema = z
  .object({
    name: z.string({ required_error: "Name is required" }).min(2, "Name is required").max(50, "Name must be at most 50 characters"),
    slug: z.string({ required_error: "Slug is required" }).min(2, "Slug is required").max(50, "Slug must be at most 50 characters"),
    use_in_menu: z.boolean({ required_error: "Use in menu is required" }),
  })
  .strict();

// Middleware para usar na rota
const updateCategoryValidator = (req, res, next) => {
  const result = updateCategorySchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = { updateCategoryValidator };
