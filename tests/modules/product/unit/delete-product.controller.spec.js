const DeleteProductController = require('../../../../src/modules/product/http/controllers/delete-product.controller');
const DeleteProductService = require('../../../../src/modules/product/core/services/delete-product.service');

jest.mock('../../../../src/modules/product/core/services/delete-product.service');

describe('DeleteProductController', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            params: { id: 1 }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should return 204 on successful deletion', async () => {
        // Arrange
        DeleteProductService.execute.mockResolvedValue(true);

        // Act
        await DeleteProductController.handle(req, res);

        // Assert
        expect(DeleteProductService.execute).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 when product is not found', async () => {
        // Arrange
        const error = new Error('Product not found');
        DeleteProductService.execute.mockRejectedValue(error);

        // Act
        await DeleteProductController.handle(req, res);

        // Assert
        expect(DeleteProductService.execute).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });

    it('should return 400 on generic error', async () => {
        // Arrange
        const error = new Error('Unexpected error');
        DeleteProductService.execute.mockRejectedValue(error);

        // Act
        await DeleteProductController.handle(req, res);

        // Assert
        expect(DeleteProductService.execute).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected error' });
    });
});
