const { z } = require("zod");

/**
 * Schema Zod de validação para a payload de checkout (Criação de Pedido).
 * Assegura que a especificação da IA FrontEnd é atendida perfeitamente, garantindo forte tipagem em informações sensíveis.
 */
const createOrderSchema = z
  .object({
    personal_info: z
      .object({
        full_name: z.string().min(1, "Nome completo é obrigatório"),
        cpf: z.string().min(11, "CPF inválido").max(14, "CPF muito longo"),
        email: z.string().email("E-mail inválido"),
        phone: z.string().min(10, "Telefone inválido"),
      })
      .strict(),
    delivery_address: z
      .object({
        address: z.string().min(1, "Endereço é obrigatório"),
        neighborhood: z.string().min(1, "Bairro é obrigatório"),
        city: z.string().min(1, "Cidade é obrigatória"),
        cep: z.string().min(8, "CEP inválido"),
        complement: z.string().max(255).optional(),
        state: z.string().optional(),
      })
      .strict(),
    payment: z
      .object({
        method: z.enum(["credit-card", "boleto", "pix"], { required_error: "Método de pagamento é obrigatório" }),
        installments: z.number().int().min(1).max(24).optional(),
        card_holder: z.string().optional(),
        card_number: z.string().optional(),
        card_expiry: z.string().optional(),
        card_cvv: z.string().optional(),
      })
      .strict(),
  })
  .strict();

/**
 * Middleware Express para validar a requisição de Checkout
 */
const createOrderValidator = (req, res, next) => {
  const result = createOrderSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }

  req.body = result.data;
  next();
};

module.exports = { createOrderValidator, createOrderSchema };
