const { z } = require("zod");

// Definição do Schema
const createUserSchema = z
  .object({
    firstname: z.string({ required_error: "Firstname is required" }).min(1, "Firstname is required").max(50, "Firstname must be at most 50 characters"),

    surname: z.string({ required_error: "Surname is required" }).min(1, "Surname is required").max(50, "Surname must be at most 50 characters"),

    email: z.string({ required_error: "Email is required" }).email("Invalid email"),

    password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters").max(100, "Password must be at most 100 characters"),

    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(6, "Confirm password is required")
      .max(100, "Confirm password must be at most 100 characters"),

    // Não incluir 'role' no schema para impedir que o cliente envie esse campo
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Aponta o erro especificamente para este campo
  })
  .strict();

// Middleware para usar na rota
const createUserValidator = (req, res, next) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    // Formata os erros para um array simples de objetos
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return res.status(400).json({ errors });
  }

  // Se passou na validação, segue o fluxo
  next();
};

module.exports = { createUserValidator };
