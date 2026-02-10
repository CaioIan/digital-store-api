const { z } = require("zod");

// Definição dos Schemas
const categoryItemSchema = z
  .object({
    id: z.string().uuid().optional(), // Aceita UUID ou undefined se o banco falhar
    name: z.string().optional(),
    slug: z.string().optional(),
    use_in_menu: z.coerce.boolean().optional(),
  })
  .partial();

const searchResponseSchema = z.object({
  data: z.array(categoryItemSchema),
  total: z.coerce.number().int().default(0),
  limit: z.coerce.number().int().default(12),
  page: z.coerce.number().int().min(1).default(1),
});

const searchCategoryResponseDto = {
  toResponse(payload) {
    // Normalização defensiva
    const safePayload = {
      data: payload.data?.map((item) => (typeof item.toJSON === "function" ? item.toJSON() : item)) || [],
      total: payload.total,
      limit: payload.limit,
      page: payload.page,
    };

    return searchResponseSchema.parse(safePayload);
  },
};

module.exports = searchCategoryResponseDto;
