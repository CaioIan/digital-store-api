const { z } = require('zod');

// Definição do Schema
const createUserSchema = z.object({
  firstname: z
    .string({ required_error: 'Firstname is required' })
    .min(1, 'Firstname is required'),

  surname: z
    .string({ required_error: 'Surname is required' })
    .min(1, 'Surname is required'),

  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),

  confirmPassword: z
    .string({ required_error: 'Confirm password is required' })
    .min(6, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // Aponta o erro especificamente para este campo
});

// Middleware para usar na rota
const createUserValidation = (req, res, next) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    // Formata os erros para um array simples de objetos
    const errors = result.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return res.status(400).json({ errors });
  }

  // Se passou na validação, segue o fluxo
  next();
};

module.exports = { createUserValidation };