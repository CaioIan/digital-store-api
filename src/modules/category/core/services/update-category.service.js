const CategoryRepository = require("../../persistence/category.repository");

class UpdateCategoryService {
    async execute(targetCategoryId, data) {
        const category = await CategoryRepository.findById(targetCategoryId);

        if (!category) {
            throw new Error("Category not found");
        }

        const updatedCategory = await CategoryRepository.update(targetCategoryId, data);

        return updatedCategory;
    }   
}

module.exports = new UpdateCategoryService();