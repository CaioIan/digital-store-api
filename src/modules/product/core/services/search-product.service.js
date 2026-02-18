const ProductRepository = require("../../persistence/product.repository");

class ListProductsService {
  async execute(params) {
    return await ProductRepository.listProducts(params);
  }
}

module.exports = new ListProductsService();