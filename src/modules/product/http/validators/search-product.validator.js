const { z } = require("zod");

const searchProductSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .default(12)
    .refine((val) => val === -1 || val > 0, {
      message: "Limit must be positive or -1",
    }),

  page: z.coerce.number().int().min(1).default(1),

  fields: z.string().optional(),

  match: z.string().optional(),

  category_ids: z.string().optional(),

  "price-range": z
    .string()
    .optional()
    .refine((val) => {
        if (!val) return true;
        const parts = val.split("-");
        return parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]));
    }, { message: "Price range must be in format 'min-max'" }),

  option: z.any().optional(),
});

const searchProductValidator = (req, res, next) => {
  // Copia o query para um objeto simples para manipulação segura
  const queryObj = { ...req.query };
  const options = {};

  for (const key in queryObj) {
    if (key.startsWith("option[") && key.endsWith("]")) {
      const optionId = key.match(/option\[(.*?)\]/)[1];
      options[optionId] = queryObj[key];
      delete queryObj[key]; 
    }
  }

  if (Object.keys(options).length > 0) {
    queryObj.option = options;
  }

  const result = searchProductSchema.safeParse(queryObj);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }

  // Armazena os dados validados no res.locals para garantir que cheguem no controller
  res.locals.searchParams = result.data;
  next();
};

module.exports = { searchProductValidator };
