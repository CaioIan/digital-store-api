const getProductByIdService = require("../../../../src/modules/product/core/services/get-product-by-id.service");
const productRepository = require("../../../../src/modules/product/persistence/product.repository");

// Mock do repository
jest.mock("../../../../src/modules/product/persistence/product.repository");

describe("GetProductByIdService - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("deve retornar o produto quando encontrado pelo ID", async () => {
      const mockProduct = {
        id: 1,
        name: "Test Product",
        slug: "test-product",
      };

      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await getProductByIdService.execute(1);

      expect(productRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProduct);
    });

    it("deve lançar erro 'Product not found' quando produto não existir", async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(getProductByIdService.execute(999)).rejects.toThrow("Product not found");

      expect(productRepository.findById).toHaveBeenCalledWith(999);
    });
  });
});
