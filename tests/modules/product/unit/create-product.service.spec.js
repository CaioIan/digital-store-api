const createProductService = require("../../../../src/modules/product/core/services/create-product.service");
const productRepository = require("../../../../src/modules/product/persistence/product.repository");
const { Product, Category } = require("../../../../src/models");

// Mock do repository e models
jest.mock("../../../../src/modules/product/persistence/product.repository");
jest.mock("../../../../src/models", () => ({
  Product: {
    findOne: jest.fn(),
  },
  Category: {
    findAll: jest.fn(),
  },
}));

describe("CreateProductService - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validProductData = {
    enabled: true,
    name: "Produto Teste",
    slug: "produto-teste",
    price: 100,
    price_with_discount: 80,
    stock: 10,
    description: "Descrição teste",
    use_in_menu: true,
    category_ids: ["uuid-categoria-1"],
    images: [],
    options: [],
  };

  describe("execute", () => {
    it("deve criar um produto com sucesso quando não existe conflito", async () => {
      const mockCreatedProduct = {
        id: 1,
        ...validProductData,
        toJSON: () => mockCreatedProduct,
      };

      // Mock: Não existe produto com mesmo nome/slug
      Product.findOne.mockResolvedValue(null);

      // Mock: Categorias existem
      Category.findAll.mockResolvedValue([{ id: "uuid-categoria-1" }]);

      // Mock: Criação do produto
      productRepository.createProduct.mockResolvedValue(mockCreatedProduct);

      const result = await createProductService.execute(validProductData);

      expect(Product.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
        })
      );
      expect(Category.findAll).toHaveBeenCalledWith({
        where: { id: validProductData.category_ids },
      });
      expect(productRepository.createProduct).toHaveBeenCalledWith({
        productData: expect.objectContaining({
          name: validProductData.name,
          slug: validProductData.slug,
        }),
        images: [],
        options: [],
        categoryIds: validProductData.category_ids,
      });
      expect(result).toEqual(mockCreatedProduct);
      expect(result).toHaveProperty("id");
    });

    it("deve lançar erro quando já existe produto com o mesmo slug", async () => {
      const existingProduct = {
        id: 2,
        name: "Outro Produto",
        slug: "produto-teste",
      };

      Product.findOne.mockResolvedValue(existingProduct);

      await expect(createProductService.execute(validProductData)).rejects.toThrow(
        "Produto já existe (nome ou slug duplicado)",
      );

      expect(Product.findOne).toHaveBeenCalled();
      expect(Category.findAll).not.toHaveBeenCalled();
      expect(productRepository.createProduct).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando já existe produto com o mesmo nome", async () => {
      const existingProduct = {
        id: 3,
        name: "Produto Teste",
        slug: "outro-slug",
      };

      Product.findOne.mockResolvedValue(existingProduct);

      await expect(createProductService.execute(validProductData)).rejects.toThrow(
        "Produto já existe (nome ou slug duplicado)",
      );

      expect(productRepository.createProduct).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando categoria não é encontrada", async () => {
      Product.findOne.mockResolvedValue(null);
      Category.findAll.mockResolvedValue([]);

      await expect(createProductService.execute(validProductData)).rejects.toThrow("Categorias não encontradas");

      expect(Category.findAll).toHaveBeenCalled();
      expect(productRepository.createProduct).not.toHaveBeenCalled();
    });

    it("deve criar produto sem categorias quando category_ids não for fornecido", async () => {
      const dataWithoutCategories = { ...validProductData, category_ids: undefined };
      const mockCreatedProduct = { id: 4, ...dataWithoutCategories };

      Product.findOne.mockResolvedValue(null);
      productRepository.createProduct.mockResolvedValue(mockCreatedProduct);

      const result = await createProductService.execute(dataWithoutCategories);

      expect(Category.findAll).not.toHaveBeenCalled();
      expect(productRepository.createProduct).toHaveBeenCalledWith({
        productData: expect.anything(),
        images: [],
        options: [],
        categoryIds: [],
      });
      expect(result).toEqual(mockCreatedProduct);
    });
  });
});
