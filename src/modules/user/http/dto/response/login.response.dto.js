const { z } = require("zod");

const LoginResponseDto = z.object({
  token: z.string(),
  user: z.object({
    id: z.string().uuid(),
    firstname: z.string(),
    surname: z.string(),
    email: z.string().email(),
  }),
});

module.exports = LoginResponseDto;
