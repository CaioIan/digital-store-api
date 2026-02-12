const { z } = require("zod");

const createUserResponseSchema = z.object({
  id: z.string().uuid(),
  firstname: z.string(),
  surname: z.string(),
  email: z.string().email(),
});

const CreateUserResponseDto = {
  toResponse(payload) {
    return createUserResponseSchema.parse(payload);
  },
};

module.exports = CreateUserResponseDto;
