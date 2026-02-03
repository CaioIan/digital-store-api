const { z } = require("zod");

const GetUserByIdResponseDto = z.object({
  user: z.object({
    id: z.string().uuid(),
    firstname: z.string(),
    surname: z.string(),
    email: z.string().email(),
  }),
});

module.exports = GetUserByIdResponseDto;
