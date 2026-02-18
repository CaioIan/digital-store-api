const listProductsService = require("../../../../src/modules/product/core/services/list-products.service");
const productRepository = require("../../../../src/modules/product/persistence/product.repository");

// Mock do repository
jest.mock("../../../../src/modules/product/persistence/product.repository");

describe("ListProductsService - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("deve chamar o repositório com os parâmetros corretos", async () => {
      const params = {
        limit: 10,
        page: 2,
        match: "nike",
        priceRange: "100-200",
        option: { 1: "40" },
        category_ids: "1,2",
        fields: "name,price",
      };

      const mockResponse = {
        data: [{ id: 1, name: "Nike" }],
        total: 1,
        limit: 10,
        page: 2,
      };

      productRepository.listProducts.mockResolvedValue(mockResponse);

      const result = await listProductsService.execute(params);

      expect(productRepository.listProducts).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });

    it("deve chamar o repositório com objeto vazio se nenhum parâmetro for passado", async () => {
      const mockResponse = {
        data: [],
        total: 0,
        limit: 12,
        page: 1,
      };

      productRepository.listProducts.mockResolvedValue(mockResponse);

      const result = await listProductsService.execute({});

      expect(productRepository.listProducts).toHaveBeenCalledWith({});
      expect(result).toEqual(mockResponse);
    });

    it("deve repassar parâmetros parciais para o repositório", async () => {
       const params = {
        limit: -1,
      };

      const mockResponse = {
        data: [],
        total: 10,
        limit: -1,
        page: 1,
      };

      productRepository.listProducts.mockResolvedValue(mockResponse);

      const result = await listProductsService.execute(params);

      expect(productRepository.listProducts).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });
  });
});
