const getCategoryByIdService = require("../../../../src/modules/category/core/services/get-category-by-id.service");
const categoryRepository = require("../../../../src/modules/category/persistence/category.repository");

// Mock do repository
jest.mock("../../../../src/modules/category/persistence/category.repository");

describe("GetCategoryByIdService - Unit Tests", () => {
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
    it("deve retornar a categoria quando encontrada pelo ID", async () => {
      categoryRepository.findById.mockResolvedValue(mockCategory);

      const result = await getCategoryByIdService.execute(mockCategory.id);

      expect(categoryRepository.findById).toHaveBeenCalledWith(mockCategory.id);
      expect(result).toEqual(mockCategory);
      expect(result.id).toBe(mockCategory.id);
      expect(result.name).toBe("Eletrônicos");
    });

    it("deve retornar null quando a categoria não existe", async () => {
      categoryRepository.findById.mockResolvedValue(null);

      const result = await getCategoryByIdService.execute("non-existent-id");

      expect(categoryRepository.findById).toHaveBeenCalledWith("non-existent-id");
      expect(result).toBeNull();
    });

    it("deve propagar erro quando o repository falha", async () => {
      categoryRepository.findById.mockRejectedValue(new Error("Database error"));

      await expect(getCategoryByIdService.execute(mockCategory.id)).rejects.toThrow("Database error");

      expect(categoryRepository.findById).toHaveBeenCalledWith(mockCategory.id);
    });
  });
});
