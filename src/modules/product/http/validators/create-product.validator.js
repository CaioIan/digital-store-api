const { z } = require("zod");

// Schema de imagem (apenas URL do Cloudinary)
const imageSchema = z.object({
  type: z.string({ required_error: "Image type is required" }),
  content: z.string({ required_error: "Image URL is required" }).url("Content must be a valid URL"),
});

// Schema de opção
const optionSchema = z
  .object({
    title: z.string({ required_error: "Option title is required" }).min(1, "Option title is required"),
    shape: z.enum(["square", "circle"]).optional(),
    radius: z.number().int().optional(),
    type: z.enum(["text", "color"]).optional(),
    values: z.array(z.string()).optional(),
  })
  // Normaliza "value" para "values" (payload da documentação usa ambos)
  .transform((data) => {
    if (data.value && !data.values) {
      data.values = data.value;
      delete data.value;
    }
    return data;
  });

// Schema principal de criação de produto
const createProductSchema = z
  .object({
    enabled: z.boolean().optional(),
    name: z.string({ required_error: "Name is required" }).min(1, "Name is required"),
    slug: z.string({ required_error: "Slug is required" }).min(1, "Slug is required"),
    use_in_menu: z.boolean().optional(),
    stock: z.number().int().min(0, "Stock cannot be negative").optional(),
    description: z.string().optional(),
    price: z.number({ required_error: "Price is required" }).positive("Price must be positive"),
    price_with_discount: z.number({ required_error: "Price with discount is required" }).positive("Price with discount must be positive"),
    category_ids: z.array(z.string().uuid("Each category_id must be a valid UUID")).optional(),
    images: z.array(imageSchema).optional(),
    options: z.array(optionSchema).optional(),
  })
  .strict()
  .refine((data) => data.price_with_discount <= data.price, {
    message: "Price with discount must be less than or equal to price",
    path: ["price_with_discount"],
  });

// Middleware para usar na rota
const createProductValidator = (req, res, next) => {
  const result = createProductSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }

  // Substitui o body pelo resultado validado/transformado
  req.body = result.data;
  next();
};

module.exports = { createProductValidator };
