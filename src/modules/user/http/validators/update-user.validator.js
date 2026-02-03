// src/modules/user/http/validators/update-user.validator.js
// Validador para atualização de usuário usando Zod
const { z } = require("zod");

const updateUserSchema = z
  .object({
    firstname: z.string().min(2).max(100).optional(),
    surname: z.string().min(2).max(100).optional(),
  })
  .strict();

const updateUserValidator = (req, res, next) => {
  const result = updateUserSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = { updateUserValidator };
