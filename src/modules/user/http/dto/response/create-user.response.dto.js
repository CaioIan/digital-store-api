const { z } = require("zod");

const CreateUserResponseDto = z.object({
  user: z.object({
    id: z.string().uuid(),
    firstname: z.string(),
    surname: z.string(),
    email: z.string().email(),
  }),
});

module.exports = CreateUserResponseDto;
