const { z } = require("zod");

/** Schema Zod de validação para imagem de produto na atualização. */
const imageSchema = z.object({
  type: z.string({ required_error: "Tipo da imagem é obrigatório" }),
  content: z.string({ required_error: "URL da imagem é obrigatória" }).url("Conteúdo deve ser uma URL válida"),
});

/** Schema Zod de validação para opções de produto na atualização. */
const optionSchema = z
  .object({
    title: z
      .string({ required_error: "Título da opção é obrigatório" })
      .min(1, "Título da opção é obrigatório")
      .max(30, "Título da opção deve ter no máximo 30 caracteres"),
    shape: z.enum(["square", "circle"]).optional(),
    radius: z.number().int().optional(),
    type: z.enum(["text", "color"]).optional(),
    category_id: z.uuid("category_id da opção deve ser um UUID válido").optional(),
    values: z.array(z.string().max(255, "Valor da opção deve ter no máximo 255 caracteres")).optional(),
  })
  .transform((data) => {
    if (data.value && !data.values) {
      data.values = data.value;
      delete data.value;
    }
    return data;
  });

/**
 * Schema Zod de validação para atualização de produto.
 * Todos os campos são opcionais (PATCH). Valida consistência de preço
 * e garante que ao menos um campo seja fornecido.
 */
const updateProductSchema = z
  .object({
    enabled: z.boolean().optional(),
    name: z.string().min(1, "Nome não pode ser vazio").max(100, "Nome deve ter no máximo 100 caracteres").optional(),
    slug: z.string().min(1, "Slug não pode ser vazio").max(100, "Slug deve ter no máximo 100 caracteres").optional(),
    use_in_menu: z.boolean().optional(),
    stock: z.number().int().min(0, "Estoque não pode ser negativo").optional(),
    description: z.string().max(1000, "Descrição deve ter no máximo 1000 caracteres").optional(),
    brand: z.string().max(100, "Marca deve ter no máximo 100 caracteres").optional(),
    gender: z.enum(["Masculino", "Feminino", "Unisex"]).optional(),
    price: z.number().positive("Preço deve ser positivo").optional(),
    price_with_discount: z.number().positive("Preço com desconto deve ser positivo").optional(),
    display_order: z.number().int().min(1, "Ordem de exibição deve ser maior ou igual a 1").nullable().optional(),
    category_ids: z.array(z.uuid("Cada category_id deve ser um UUID válido")).optional(),
    images: z.array(imageSchema).optional(),
    options: z.array(optionSchema).optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.price !== undefined && data.price_with_discount !== undefined) {
        return data.price_with_discount <= data.price;
      }
      return true;
    },
    {
      message: "Preço com desconto deve ser menor ou igual ao preço",
      path: ["price_with_discount"],
    },
  )
  .refine((data) => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser fornecido para atualização",
    path: [],
  });

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Middleware Express que valida params e body da requisição contra os schemas de atualização.
 * Retorna 400 com erros por campo se a validação falhar.
 * @param {import('express').Request} req - Objeto de requisição do Express.
 * @param {import('express').Response} res - Objeto de resposta do Express.
 * @param {import('express').NextFunction} next - Função next do Express.
 */
const updateProductValidator = (req, res, next) => {
  const paramsResult = paramsSchema.safeParse(req.params);
  if (!paramsResult.success) {
    const errors = paramsResult.error.issues.map((err) => ({
      field: `params.${err.path.join(".")}`,
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }

  const bodyResult = updateProductSchema.safeParse(req.body);
  if (!bodyResult.success) {
    const errors = bodyResult.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }

  req.params.id = paramsResult.data.id;
  req.body = bodyResult.data;

  next();
};

module.exports = { updateProductValidator };
