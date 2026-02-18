const ProductRepository = require('../../persistence/product.repository');

class UpdateProductService {
    async execute(targetProductId, body) {
        const targetProduct = await ProductRepository.findById(targetProductId);

        if (!targetProduct) {
            throw new Error('Product not found');
        }

        const updatedProduct = await ProductRepository.updateProduct(targetProductId, body);

        return updatedProduct;
    }
}

module.exports = new UpdateProductService();