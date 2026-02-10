const categoryRepository = require("../../persistence/category.repository");

class GetCategoryByIdService {
  async execute(targetCategoryId) {
    const response = await categoryRepository.findById(targetCategoryId);
    return response;
  }
}

module.exports = new GetCategoryByIdService();
