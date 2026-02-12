const categoryRepository = require("../../persistence/category.repository");

class GetCategoryByIdService {
  async execute(targetCategoryId) {
    const response = await categoryRepository.findById(targetCategoryId);
    if (!response) {
      throw new Error("Category not found.");
    }
    return response;
  }
}

module.exports = new GetCategoryByIdService();
