const { z } = require("zod");

const createProductResponseSchema = z.object({
  id: z.number(),
  enabled: z.boolean(),
  name: z.string(),
  slug: z.string(),
  use_in_menu: z.boolean(),
  stock: z.number(),
  description: z.string().nullable(),
  price: z.number(),
  price_with_discount: z.number(),
  category_ids: z.array(z.string()),
  images: z.array(
    z.object({
      id: z.number(),
      enabled: z.boolean(),
      path: z.string(),
    })
  ),
  options: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      shape: z.string().nullable(),
      radius: z.number().nullable(),
      type: z.string().nullable(),
      values: z.array(z.string()),
    })
  ),
});

const CreateProductResponseDto = {
  toResponse(product) {
    const plain = product.toJSON ? product.toJSON() : product;

    const payload = {
      ...plain,
      category_ids: (plain.categories || []).map((c) => c.id),
      images: (plain.images || []).map((img) => ({
        id: img.id,
        enabled: img.enabled,
        path: img.path,
      })),
      options: (plain.options || []).map((opt) => ({
        id: opt.id,
        title: opt.title,
        shape: opt.shape,
        radius: opt.radius,
        type: opt.type,
        values: typeof opt.values === "string" ? JSON.parse(opt.values) : opt.values,
      })),
    };

    // Remove campos internos do Sequelize
    delete payload.categories;
    delete payload.created_at;
    delete payload.updated_at;

    return createProductResponseSchema.parse(payload);
  },
};

module.exports = CreateProductResponseDto;
