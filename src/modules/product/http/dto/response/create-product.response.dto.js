const { z } = require("zod");

/**
 * Schema Zod para a resposta de criação de produto.
 * Inclui campos do produto, imagens, opções e categorias.
 * @type {import('zod').ZodObject}
 */
const createProductResponseSchema = z.object({
  id: z.number(),
  enabled: z.boolean(),
  name: z.string(),
  slug: z.string(),
  use_in_menu: z.boolean(),
  stock: z.number(),
  description: z.string().nullable(),
  price: z.number(),
  price_with_discount: z.number(),
  display_order: z.number().int().nullable().optional(),
  category_ids: z.array(z.string()),
  images: z.array(
    z.object({
      id: z.number(),
      enabled: z.boolean(),
      path: z.string(),
    }),
  ),
  options: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      shape: z.string().nullable(),
      radius: z.number().nullable(),
      type: z.string().nullable(),
      values: z.array(z.string()),
    }),
  ),
});

/**
 * DTO de resposta para criação de produtos.
 * Normaliza dados do Sequelize, extrai category_ids e parseia options.values.
 */
const CreateProductResponseDto = {
  /**
   * Transforma o payload do produto criado em resposta segura para a API.
   * @param {Object} product - Instância do model Sequelize ou objeto puro.
   * @returns {Object} Dados filtrados e normalizados pelo schema Zod.
   */
  toResponse(product) {
    const plain = product.toJSON ? product.toJSON() : product;

    const payload = {
      ...plain,
      category_ids: (plain.categories || []).map((c) => c.id),
      images: (plain.images || []).map((img) => ({
        id: img.id,
        enabled: img.enabled,
        path: img.path,
      })),
      options: (plain.options || []).map((opt) => ({
        id: opt.id,
        title: opt.title,
        shape: opt.shape,
        radius: opt.radius,
        type: opt.type,
        values: typeof opt.values === "string" ? JSON.parse(opt.values) : opt.values,
      })),
    };

    // Remove campos internos do Sequelize
    delete payload.categories;
    delete payload.created_at;
    delete payload.updated_at;

    return createProductResponseSchema.parse(payload);
  },
};

module.exports = CreateProductResponseDto;
