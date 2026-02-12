const { z } = require("zod");

const loginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string().uuid(),
    firstname: z.string(),
    surname: z.string(),
    email: z.string().email(),
  }),
});

const LoginResponseDto = {
  toResponse(payload) {
    return loginResponseSchema.parse(payload);
  },
};

module.exports = LoginResponseDto;
