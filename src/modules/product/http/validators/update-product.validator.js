const { z } = require("zod");

// Reuse schemas from create-product but make them optional for update
const imageSchema = z.object({
  type: z.string({ required_error: "Image type is required" }),
  content: z.string({ required_error: "Image URL is required" }).url("Content must be a valid URL"),
});

const optionSchema = z
  .object({
    title: z.string({ required_error: "Option title is required" }).min(1, "Option title is required"),
    shape: z.enum(["square", "circle"]).optional(),
    radius: z.number().int().optional(),
    type: z.enum(["text", "color"]).optional(),
    values: z.array(z.string()).optional(),
  })
  .transform((data) => {
    if (data.value && !data.values) {
      data.values = data.value;
      delete data.value;
    }
    return data;
  });

const updateProductSchema = z
  .object({
    enabled: z.boolean().optional(),
    name: z.string().min(1, "Name cannot be empty").optional(),
    slug: z.string().min(1, "Slug cannot be empty").optional(),
    use_in_menu: z.boolean().optional(),
    stock: z.number().int().min(0, "Stock cannot be negative").optional(),
    description: z.string().optional(),
    price: z.number().positive("Price must be positive").optional(),
    price_with_discount: z.number().positive("Price with discount must be positive").optional(),
    category_ids: z.array(z.string().uuid("Each category_id must be a valid UUID")).optional(),
    images: z.array(imageSchema).optional(),
    options: z.array(optionSchema).optional(),
  })
  .strict()
  .refine(
    (data) => {
      // Validates price consistent only if both fields are present in the update payload
      // Ideally, we should check against the DB if one is missing, but for a simple DTO validaton:
      if (data.price !== undefined && data.price_with_discount !== undefined) {
        return data.price_with_discount <= data.price;
      }
      return true;
    },
    {
      message: "Price with discount must be less than or equal to price",
      path: ["price_with_discount"],
    }
  )
  .refine(
    (data) => Object.keys(data).length > 0, 
    {
      message: "At least one field must be provided for update",
      path: [], // Custom error location, or use root
    }
  );

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const updateProductValidator = (req, res, next) => {
  // Validate params
  const paramsResult = paramsSchema.safeParse(req.params);
  if (!paramsResult.success) {
    const errors = paramsResult.error.issues.map((err) => ({
      field: `params.${err.path.join(".")}`,
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }

  // Validate body
  const bodyResult = updateProductSchema.safeParse(req.body);
  if (!bodyResult.success) {
    const errors = bodyResult.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }

  // Assign validated data
  req.params.id = paramsResult.data.id;
  req.body = bodyResult.data;
  
  next();
};

module.exports = { updateProductValidator };
