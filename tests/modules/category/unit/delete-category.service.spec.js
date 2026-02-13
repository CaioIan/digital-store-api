// Testes unitários para delete-category.service.js

const deleteCategoryService = require("../../../../src/modules/category/core/services/delete-category.service");
const categoryRepository = require("../../../../src/modules/category/persistence/category.repository");

// Mock do repository
jest.mock("../../../../src/modules/category/persistence/category.repository");

describe("DeleteCategoryService - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCategory = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Eletrônicos",
    slug: "eletronicos",
    use_in_menu: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("execute", () => {
    it("deve deletar categoria com sucesso quando ela existe", async () => {
      categoryRepository.findById.mockResolvedValue(mockCategory);
      categoryRepository.softDelete.mockResolvedValue(mockCategory);

      const result = await deleteCategoryService.execute(mockCategory.id);

      expect(result).toHaveProperty("id", mockCategory.id);
      expect(result).toHaveProperty("name", mockCategory.name);
      expect(result).toHaveProperty("slug", mockCategory.slug);
      expect(result).toHaveProperty("use_in_menu", mockCategory.use_in_menu);
    });

    it("deve chamar repository com os parâmetros corretos", async () => {
      categoryRepository.findById.mockResolvedValue(mockCategory);
      categoryRepository.softDelete.mockResolvedValue(mockCategory);

      await deleteCategoryService.execute(mockCategory.id);

      expect(categoryRepository.findById).toHaveBeenCalledWith(mockCategory.id);
      expect(categoryRepository.softDelete).toHaveBeenCalledWith(mockCategory.id);
    });

    it("deve lançar erro quando categoria não existe", async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(
        deleteCategoryService.execute("non-existent-id"),
      ).rejects.toThrow("Category not found.");

      expect(categoryRepository.findById).toHaveBeenCalledWith("non-existent-id");
      expect(categoryRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
