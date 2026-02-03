const { z } = require("zod");

const loginSchema = z.object({
  email: z.string({ required_error: "Email é obrigatório" }).email("Email inválido"),
  password: z.string({ required_error: "Senha é obrigatória" }).min(1, "Senha é obrigatória"),
});

const loginValidator = (req, res, next) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }
  next();
};

module.exports = { loginValidator };
