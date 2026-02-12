const { z } = require("zod");

const getUserByIdResponseSchema = z.object({
  id: z.string().uuid(),
  firstname: z.string(),
  surname: z.string(),
  email: z.string().email(),
});

const GetUserByIdResponseDto = {
  toResponse(payload) {
    return getUserByIdResponseSchema.parse(payload);
  },
};

module.exports = GetUserByIdResponseDto;
