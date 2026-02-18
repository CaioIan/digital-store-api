const ProductRepository = require("../../persistence/product.repository");

class GetProductByIdService {
    async execute(targetProductId) {
        const product = await ProductRepository.findById(targetProductId);

        if (!product) {
            throw new Error("Product not found");
        }

        return product;
    }
}

module.exports = new GetProductByIdService();