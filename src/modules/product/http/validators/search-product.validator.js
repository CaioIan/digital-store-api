const { z } = require("zod");

const listProductsSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .default(12)
    .refine((val) => val === -1 || val > 0, {
      message: "Limit must be positive or -1",
    }),

  page: z.coerce.number().int().min(1).default(1),

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

  match: z.string().optional(),

  category_ids: z
    .string()
    .optional()
    .transform((val) =>
        val
            ? val.split(",").map((id) => id.trim()).filter(Boolean)
            : undefined
    ),

  "price-range": z
    .string()
    .optional()
    .refine((val) => {
        if (!val) return true;
        const parts = val.split("-");
        return parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]));
    }, { message: "Price range must be in format 'min-max'" }),

  option: z.record(z.string()).optional(),
});

const listProductsValidator = (req, res, next) => {
  const result = listProductsSchema.safeParse(req.query);

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

module.exports = { listProductsValidator };
