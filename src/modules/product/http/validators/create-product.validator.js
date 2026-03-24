const { z } = require("zod");

/** Schema Zod de validação para criação de imagem de produto (URL do Cloudinary). */
const imageSchema = z.object({
  type: z.string({ required_error: "Tipo da imagem é obrigatório" }),
  content: z.string({ required_error: "URL da imagem é obrigatória" }).url("Conteúdo deve ser uma URL válida"),
});

/** Schema Zod de validação para opções de produto. */
const optionSchema = z
  .object({
    title: z
      .string({ required_error: "Título da opção é obrigatório" })
      .min(1, "Título da opção é obrigatório")
      .max(30, "Título da opção deve ter no máximo 30 caracteres"),
    shape: z.enum(["square", "circle"]).optional(),
    radius: z.number().int().optional(),
    type: z.enum(["text", "color"]).optional(),
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
 * Schema Zod de validação para criação de produto.
 * Valida todos os campos obrigatórios e opcionais, incluindo imagens, opções e categorias.
 */
const createProductSchema = z
  .object({
    enabled: z.boolean().default(false),
    name: z
      .string({ required_error: "Nome é obrigatório" })
      .min(1, "Nome é obrigatório")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    slug: z
      .string({ required_error: "Slug é obrigatório" })
      .min(1, "Slug é obrigatório")
      .max(100, "Slug deve ter no máximo 100 caracteres"),
    use_in_menu: z.boolean().default(false),
    stock: z.number().int().min(0, "Estoque não pode ser negativo").default(0),
    description: z
      .string({ required_error: "Descrição é obrigatória" })
      .min(10, "Descrição deve ter no mínimo 10 caracteres")
      .max(1000, "Descrição deve ter no máximo 1000 caracteres"),
    brand: z.string().max(100, "Marca deve ter no máximo 100 caracteres").optional(),
    gender: z.enum(["Masculino", "Feminino", "Unisex"]).optional(),
    price: z.number({ required_error: "Preço é obrigatório" }).positive("Preço deve ser positivo"),
    price_with_discount: z.number().positive("Preço com desconto deve ser positivo").optional(),
    category_ids: z
      .array(z.uuid("Cada category_id deve ser um UUID válido"), { required_error: "Pelo menos uma categoria é obrigatória" })
      .min(1, "Pelo menos uma categoria é obrigatória"),
    images: z
      .array(imageSchema, { required_error: "Pelo menos uma imagem é obrigatória" })
      .min(1, "Pelo menos uma imagem é obrigatória"),
    options: z.array(optionSchema).default([]),
  })
  .strict()
  .refine(
    (data) => {
      if (!data.price_with_discount) return true;
      return data.price_with_discount <= data.price;
    },
    {
      message: "Preço com desconto deve ser menor ou igual ao preço",
      path: ["price_with_discount"],
    },
  );

/**
 * Middleware Express que valida o body da requisição contra o createProductSchema.
 * Retorna 400 com erros por campo se a validação falhar, caso contrário segue para o próximo handler.
 * @param {import('express').Request} req - Objeto de requisição do Express.
 * @param {import('express').Response} res - Objeto de resposta do Express.
 * @param {import('express').NextFunction} next - Função next do Express.
 */
const createProductValidator = (req, res, next) => {
  const result = createProductSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }

  req.body = result.data;
  next();
};

module.exports = { createProductValidator };
