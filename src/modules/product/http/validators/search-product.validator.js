const { z } = require("zod");

/**
 * Schema Zod de validação para busca paginada de produtos.
 * Valida e transforma os parâmetros de query string, incluindo faixa de preço e opções.
 * @type {import('zod').ZodObject}
 */
const searchProductSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .default(12)
    .refine((val) => val === -1 || val > 0, {
      message: "Limite deve ser positivo ou -1",
    }),

  page: z.coerce.number().int().min(1).default(1),

  fields: z.string().optional(),

  match: z.string().optional(),

  category_ids: z.string().optional(),

  brand: z.string().optional(),

  gender: z.enum(["Masculino", "Feminino", "Unisex"]).optional(),

  "price-range": z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const parts = val.split("-");
        return parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]));
      },
      { message: "Faixa de preço deve estar no formato 'min-max'" },
    ),

  option: z.any().optional(),
});

/**
 * Middleware Express que valida os query params contra o searchProductSchema.
 * Extrai parâmetros option[ID]=valores da query string e os agrupa em um objeto.
 * Os dados validados são armazenados em res.locals.searchParams.
 * Retorna 400 com erros por campo se a validação falhar.
 * @param {import('express').Request} req - Objeto de requisição do Express.
 * @param {import('express').Response} res - Objeto de resposta do Express.
 * @param {import('express').NextFunction} next - Função next do Express.
 */
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

  // Armazena os dados validados no res.locals para o controller
  res.locals.searchParams = result.data;
  next();
};

module.exports = { searchProductValidator };
