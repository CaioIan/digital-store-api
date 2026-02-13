const { z } = require("zod");

const deleteCategoryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  use_in_menu: z.coerce.boolean(),
});

const DeleteCategoryResponseDto = {
  toResponse(payload) {
    return deleteCategoryResponseSchema.parse(payload);
  },
};

module.exports = DeleteCategoryResponseDto;
