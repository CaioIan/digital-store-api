const { z } = require("zod");

const productResponseSchema = z
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

const getProductByIdResponseDto = {
  toResponse(payload) {
    const safePayload = typeof payload.toJSON === "function" ? payload.toJSON() : payload;
    return productResponseSchema.parse(safePayload);
  },
};

module.exports = getProductByIdResponseDto;
