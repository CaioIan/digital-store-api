const updateProductService = require("../../../../src/modules/product/core/services/update-product.service");
const productRepository = require("../../../../src/modules/product/persistence/product.repository");

// Mock do repository
jest.mock("../../../../src/modules/product/persistence/product.repository");

describe("UpdateProductService - Testes Unitários", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const targetProductId = 1;
  const updateData = {
    price: 150.0,
    name: "Produto Atualizado"
  };

  const existingProduct = {
    id: targetProductId,
    name: "Produto Original",
    price: 100.0,
  };

  const updatedProduct = {
    ...existingProduct,
    ...updateData,
  };

  describe("execute", () => {
    it("deve atualizar um produto com sucesso quando ele existe", async () => {
      // Mock: Produto existe
      productRepository.findById.mockResolvedValue(existingProduct);
      
      // Mock: Atualização retorna produto atualizado
      productRepository.updateProduct.mockResolvedValue(updatedProduct);

      const result = await updateProductService.execute(targetProductId, updateData);

      expect(productRepository.findById).toHaveBeenCalledWith(targetProductId);
      expect(productRepository.updateProduct).toHaveBeenCalledWith(targetProductId, updateData);
      expect(result).toEqual(updatedProduct);
    });

    it("deve lançar erro quando o produto não é encontrado", async () => {
      // Mock: Produto não encontrado
      productRepository.findById.mockResolvedValue(null);

      await expect(updateProductService.execute(targetProductId, updateData))
        .rejects
        .toThrow("Product not found");

      expect(productRepository.findById).toHaveBeenCalledWith(targetProductId);
      expect(productRepository.updateProduct).not.toHaveBeenCalled();
    });
  });
});
