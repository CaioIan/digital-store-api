const { z } = require("zod");

const searchCategorySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .default(12)
    .refine((val) => val === -1 || val > 0, {
      message: "Limit must be positive or -1",
    }),

  page: z.coerce.number().int().min(1).default(1),

  // REFATORAÇÃO: O Validator agora transforma "name,slug" em ["name", "slug"]
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
