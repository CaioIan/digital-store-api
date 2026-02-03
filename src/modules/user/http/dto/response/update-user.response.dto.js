const { z } = require("zod");

const UpdateUserResponseDto = z.object({
  user: z.object({
    id: z.string().uuid(),
    firstname: z.string(),
    surname: z.string(),
    email: z.string().email(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

module.exports = UpdateUserResponseDto;
