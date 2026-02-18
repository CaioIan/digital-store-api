const ProductRepository = require("../../persistence/product.repository");

class SearchProductService {
  async execute(params) {
    return await ProductRepository.searchProducts(params);
  }
}

module.exports = new SearchProductService();