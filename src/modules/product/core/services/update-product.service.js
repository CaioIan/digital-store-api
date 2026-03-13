const AppError = require("../../../../shared/errors/app-error");
const ProductRepository = require("../../persistence/product.repository");

/**
 * Serviço responsável pela atualização de produtos.
 * Verifica existência, processa imagens (se fornecidas) e delega ao repository.
 */
class UpdateProductService {
  /**
   * Atualiza um produto existente pelo ID.
   * @param {number} targetProductId - ID numérico do produto a ser atualizado.
   * @param {Object} body - Dados de atualização (campos opcionais, PATCH).
   * @param {string} [body.name] - Novo nome do produto.
   * @param {string} [body.slug] - Novo slug do produto.
   * @param {number} [body.price] - Novo preço do produto.
   * @param {number} [body.price_with_discount] - Novo preço com desconto.
   * @param {boolean} [body.enabled] - Novo estado de habilitação.
   * @param {number} [body.stock] - Novo estoque.
   * @param {string} [body.description] - Nova descrição.
   * @param {Object[]} [body.images] - Novas imagens a serem processadas.
   * @param {Object[]} [body.options] - Novas opções do produto.
   * @param {string[]} [body.category_ids] - Novos UUIDs das categorias.
   * @returns {Promise<Object>} O produto atualizado com suas relações.
   * @throws {AppError} 404 - Se o produto não for encontrado.
   */
  async execute(targetProductId, body) {
    const targetProduct = await ProductRepository.findById(targetProductId);

    if (!targetProduct) {
      throw new AppError("Recurso não encontrado.", 404);
    }

    // Processa imagens: se o front mandar {type, content}, extraímos apenas o content (URL)
    if (body.images && body.images.length > 0) {
      body.images = body.images.map((img) => img.content);
    }

    const updatedProduct = await ProductRepository.updateProduct(targetProductId, body);

    return updatedProduct;
  }
}

module.exports = new UpdateProductService();
