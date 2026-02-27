const { z } = require("zod");

/**
 * Schema Zod de validação para busca de Detalhes de Pedido.
 * Valida o parâmetro de rota (UUID do pedido recém comprado).
 */
const getOrderByIdSchema = z.object({
  id: z.string().uuid({ message: "O ID do pedido deve ser um UUID válido." }),
});

/**
 * Middleware Express que valida os parâmetros de rota contra o getOrderByIdSchema.
 */
const getOrderByIdValidator = (req, res, next) => {
  const result = getOrderByIdSchema.safeParse(req.params);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }

  req.params.id = result.data.id;
  next();
};

module.exports = { getOrderByIdValidator };
