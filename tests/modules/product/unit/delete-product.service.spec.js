const DeleteProductService = require('../../../../src/modules/product/core/services/delete-product.service');
const ProductRepository = require('../../../../src/modules/product/persistence/product.repository');

jest.mock('../../../../src/modules/product/persistence/product.repository');

describe('DeleteProductService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete a product successfully', async () => {
        // Arrange
        const productId = 1;
        ProductRepository.deleteProduct.mockResolvedValue(true);

        // Act
        const result = await DeleteProductService.execute(productId);

        // Assert
        expect(ProductRepository.deleteProduct).toHaveBeenCalledWith(productId);
        expect(result).toBe(true);
    });

    it('should throw an error if repository fails', async () => {
        // Arrange
        const productId = 1;
        const error = new Error('Database connection failed');
        ProductRepository.deleteProduct.mockRejectedValue(error);

        // Act & Assert
        await expect(DeleteProductService.execute(productId)).rejects.toThrow('Database connection failed');
        expect(ProductRepository.deleteProduct).toHaveBeenCalledWith(productId);
    });
});
