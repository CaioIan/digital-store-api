// Testes unitários para update-category.service.js

const updateCategoryService = require("../../../../src/modules/category/core/services/update-category.service");
const categoryRepository = require("../../../../src/modules/category/persistence/category.repository");

// Mock do repository
jest.mock("../../../../src/modules/category/persistence/category.repository");

describe("UpdateCategoryService - Unit Tests", () => {
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

  const updateData = {
    name: "Games",
    slug: "games",
    use_in_menu: false,
  };

  describe("execute", () => {
    it("deve atualizar categoria com sucesso quando ela existe", async () => {
      const updatedCategory = { ...mockCategory, ...updateData };
      categoryRepository.findById.mockResolvedValue(mockCategory);
      categoryRepository.update.mockResolvedValue(updatedCategory);

      const result = await updateCategoryService.execute(mockCategory.id, updateData);

      expect(result).toHaveProperty("id");
      expect(result.name).toBe(updateData.name);
      expect(result.slug).toBe(updateData.slug);
      expect(result.use_in_menu).toBe(updateData.use_in_menu);
    });

    it("deve chamar repository com os parâmetros corretos", async () => {
      const updatedCategory = { ...mockCategory, ...updateData };
      categoryRepository.findById.mockResolvedValue(mockCategory);
      categoryRepository.update.mockResolvedValue(updatedCategory);

      await updateCategoryService.execute(mockCategory.id, updateData);

      expect(categoryRepository.findById).toHaveBeenCalledWith(mockCategory.id);
      expect(categoryRepository.update).toHaveBeenCalledWith(mockCategory.id, updateData);
    });

    it("deve lançar erro quando categoria não existe", async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(
        updateCategoryService.execute("non-existent-id", updateData),
      ).rejects.toThrow("Category not found");

      expect(categoryRepository.findById).toHaveBeenCalledWith("non-existent-id");
      expect(categoryRepository.update).not.toHaveBeenCalled();
    });

    it("deve retornar null quando update não afeta nenhuma linha", async () => {
      categoryRepository.findById.mockResolvedValue(mockCategory);
      categoryRepository.update.mockResolvedValue(null);

      const result = await updateCategoryService.execute(mockCategory.id, updateData);

      expect(result).toBeNull();
    });
  });
});
