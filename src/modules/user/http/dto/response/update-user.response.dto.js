const { z } = require("zod");

const updateUserResponseSchema = z.object({
  id: z.string().uuid(),
  firstname: z.string(),
  surname: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const UpdateUserResponseDto = {
  toResponse(payload) {
    return updateUserResponseSchema.parse(payload);
  },
};

module.exports = UpdateUserResponseDto;
