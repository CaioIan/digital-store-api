const { z } = require("zod");

const updateCategoryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  use_in_menu: z.coerce.boolean(),
});

const UpdateCategoryResponseDto = {
  toResponse(payload) {
    return updateCategoryResponseSchema.parse(payload);
  },
};

module.exports = UpdateCategoryResponseDto;
