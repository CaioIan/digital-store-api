const { z } = require("zod");

const GetCategoryByIdResponseDto = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  use_in_menu: z.coerce.boolean(),
});

module.exports = GetCategoryByIdResponseDto;
