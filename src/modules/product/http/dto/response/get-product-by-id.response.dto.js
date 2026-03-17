const { z } = require("zod");

/**
 * Schema Zod para a resposta de busca de produto por ID.
 * Inclui produto completo com imagens, opções e categorias.
 * Os valores de options.values são transformados de JSON string para array.
 * @type {import('zod').ZodObject}
 */
const productResponseSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    slug: z.string(),
    price: z.number(),
    price_with_discount: z.number(),
    description: z.string().nullable().optional(),
    brand: z.string().nullable().optional(),
    gender: z.enum(["Masculino", "Feminino", "Unisex"]).nullable().optional(),
    enabled: z.boolean(),
    stock: z.number(),
    use_in_menu: z.boolean().optional(),
    display_order: z.number().int().nullable().optional(),
    images: z
      .array(
        z.object({
          id: z.number().int(),
          path: z.string(),
          enabled: z.boolean(),
        }),
      )
      .optional(),
    options: z
      .array(
        z.object({
          id: z.number().int(),
          title: z.string(),
          values: z.string().transform((val) => {
            try {
              return JSON.parse(val);
            } catch (e) {
              return [];
            }
          }),
          shape: z.enum(["square", "circle"]).optional(),
          radius: z.number().optional(),
          type: z.enum(["text", "color"]).optional(),
        }),
      )
      .optional(),
    categories: z
      .array(
        z.object({
          id: z.uuid(),
          name: z.string(),
          slug: z.string(),
        }),
      )
      .optional(),
  })
  .partial();

/**
 * DTO de resposta para busca de produto por ID.
 * Normaliza dados do Sequelize e aplica o schema de validação.
 */
const getProductByIdResponseDto = {
  /**
   * Transforma o payload do produto em resposta segura para a API.
   * @param {Object} payload - Instância do model Sequelize ou objeto puro.
   * @returns {Object} Dados filtrados pelo schema Zod.
   */
  toResponse(payload) {
    const safePayload = typeof payload.toJSON === "function" ? payload.toJSON() : payload;
    return productResponseSchema.parse(safePayload);
  },
};

module.exports = getProductByIdResponseDto;
