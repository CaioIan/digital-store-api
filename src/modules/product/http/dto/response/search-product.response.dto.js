const { z } = require("zod");

const productItemSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    slug: z.string(),
    price: z.number(),
    price_with_discount: z.number(),
    description: z.string().nullable().optional(),
    enabled: z.boolean(),
    stock: z.number(),
    use_in_menu: z.boolean().optional(),
    images: z.array(
        z.object({
            id: z.number().int(),
            path: z.string(),
            enabled: z.boolean()
        })
    ).optional(),
    options: z.array(
        z.object({
            id: z.number().int(),
            title: z.string(),
            values: z.string().transform((val) => {
                 try {
                    return JSON.parse(val);
                 } catch (e) {
                    return [];
                 }
            }),
            shape: z.enum(["square", "circle"]).optional(),
            radius: z.number().optional(),
            type: z.enum(["text", "color"]).optional(),
        })
    ).optional(),
    categories: z.array(
        z.object({
            id: z.string().uuid(),
            name: z.string(),
            slug: z.string(),
        })
    ).optional()
  })
  .partial();

const listProductsResponseSchema = z.object({
  data: z.array(productItemSchema),
  total: z.coerce.number().int().default(0),
  limit: z.coerce.number().int().default(12),
  page: z.coerce.number().int().min(1).default(1),
});

const listProductsResponseDto = {
  toResponse(payload) {
    const safePayload = {
      data: payload.data?.map((item) => (typeof item.toJSON === "function" ? item.toJSON() : item)) || [],
      total: payload.total,
      limit: payload.limit,
      page: payload.page,
    };

    return listProductsResponseSchema.parse(safePayload);
  },
};

module.exports = listProductsResponseDto;
