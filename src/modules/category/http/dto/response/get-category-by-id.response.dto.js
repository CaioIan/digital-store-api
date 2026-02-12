const { z } = require("zod");

const getCategoryByIdResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  use_in_menu: z.coerce.boolean(),
});

const GetCategoryByIdResponseDto = {
  toResponse(payload) {
    return getCategoryByIdResponseSchema.parse(payload);
  },
};

module.exports = GetCategoryByIdResponseDto;
