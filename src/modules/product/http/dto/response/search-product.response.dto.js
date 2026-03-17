const { z } = require("zod");

/**
 * Schema Zod para um item de produto na listagem.
 * Inclui campos opcionais pois a projeção pode limitar os campos retornados.
 * Os valores de options.values são transformados de JSON string para array.
 * @type {import('zod').ZodObject}
 */
const productItemSchema = z
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
 * Schema Zod para a resposta paginada de busca de produtos.
 * Inclui metadados de paginação (total, limit, page).
 * @type {import('zod').ZodObject}
 */
const searchProductResponseSchema = z.object({
  data: z.array(productItemSchema),
  total: z.coerce.number().int().default(0),
  limit: z.coerce.number().int().default(12),
  page: z.coerce.number().int().min(1).default(1),
});

/**
 * DTO de resposta para busca paginada de produtos.
 * Normaliza dados do Sequelize e aplica o schema de validação.
 */
const searchProductResponseDto = {
  /**
   * Transforma o payload da busca em resposta segura e paginada.
   * @param {Object} payload - Dados brutos do serviço de busca.
   * @param {Object[]} payload.data - Array de produtos (models Sequelize ou objetos puros).
   * @param {number} payload.total - Total de registros encontrados.
   * @param {number} payload.limit - Limite de itens por página.
   * @param {number} payload.page - Página atual.
   * @returns {Object} Dados filtrados e paginados pelo schema Zod.
   */
  toResponse(payload) {
    const safePayload = {
      data: payload.data?.map((item) => (typeof item.toJSON === "function" ? item.toJSON() : item)) || [],
      total: payload.total,
      limit: payload.limit,
      page: payload.page,
    };

    return searchProductResponseSchema.parse(safePayload);
  },
};

module.exports = searchProductResponseDto;
