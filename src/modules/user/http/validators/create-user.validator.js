const { z } = require("zod");
const { TEMPORARY_EMAIL_DOMAINS } = require("../../../../shared/constants/temporary-email-domains");

/**
 * Schema Zod de validação para cadastro de usuário.
 * Valida campos obrigatórios, aplica confirmação de senha
 * e utiliza modo strict para rejeitar propriedades inesperadas.
 * O campo 'role' é intencionalmente excluído para prevenir escalação de privilégios.
 */
const createUserSchema = z
  .object({
    firstname: z
      .string({ required_error: "Nome é obrigatório" })
      .min(1, "Nome é obrigatório")
      .max(50, "Nome deve ter no máximo 50 caracteres"),

    surname: z
      .string({ required_error: "Sobrenome é obrigatório" })
      .min(1, "Sobrenome é obrigatório")
      .max(50, "Sobrenome deve ter no máximo 50 caracteres"),

    cpf: z
      .string({ required_error: "CPF é obrigatório" })
      .min(11, "CPF deve ter no mínimo 11 caracteres")
      .max(14, "CPF deve ter no máximo 14 caracteres"),

    phone: z
      .string({ required_error: "Telefone é obrigatório" })
      .min(10, "Telefone deve ter no mínimo 10 caracteres")
      .max(15, "Telefone deve ter no máximo 15 caracteres"),

    email: z
      .string({ required_error: "Email é obrigatório" })
      .email("Email inválido")
      .refine(
        (email) => {
          const domain = email.split("@")[1];
          return !TEMPORARY_EMAIL_DOMAINS.has(domain);
        },
        { message: "Provedores de email temporários não são permitidos" }
      ),

    password: z
      .string({ required_error: "Senha é obrigatória" })
      .min(6, "Senha deve ter no mínimo 6 caracteres")
      .max(100, "Senha deve ter no máximo 100 caracteres"),

    confirmPassword: z
      .string({ required_error: "Confirmação de senha é obrigatória" })
      .min(6, "Confirmação de senha é obrigatória")
      .max(100, "Confirmação de senha deve ter no máximo 100 caracteres"),

    endereco: z.string().min(1, "Endereço não pode ser vazio").max(200, "Endereço deve ter no máximo 200 caracteres").optional(),
    bairro: z.string().min(1, "Bairro não pode ser vazio").max(100, "Bairro deve ter no máximo 100 caracteres").optional(),
    cidade: z.string().min(1, "Cidade não pode ser vazia").max(100, "Cidade deve ter no máximo 100 caracteres").optional(),
    estado: z.string().min(1, "Estado não pode ser vazio").max(50, "Estado deve ter no máximo 50 caracteres").optional(),
    cep: z.string().min(1, "CEP não pode ser vazio").max(9, "CEP deve ter no máximo 9 caracteres").optional(),
    complemento: z.string().max(200, "Complemento deve ter no máximo 200 caracteres").optional(),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    const addressFields = ["endereco", "bairro", "cidade", "estado", "cep"];
    const filled = addressFields.filter((f) => data[f] !== undefined);

    if (filled.length > 0 && filled.length < addressFields.length) {
      const missing = addressFields.filter((f) => data[f] === undefined);
      missing.forEach((field) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} é obrigatório quando informações de endereço são fornecidas`,
          path: [field],
        });
      });
    }
  });

/**
 * Middleware Express que valida o body da requisição contra o createUserSchema.
 * Retorna 400 com erros por campo se a validação falhar, caso contrário segue para o próximo handler.
 * @param {import('express').Request} req - Objeto de requisição do Express.
 * @param {import('express').Response} res - Objeto de resposta do Express.
 * @param {import('express').NextFunction} next - Função next do Express.
 */
const createUserValidator = (req, res, next) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return res.status(400).json({ errors });
  }

  next();
};

module.exports = { createUserValidator };
