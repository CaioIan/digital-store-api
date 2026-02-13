const CategoryRepository = require("../../persistence/category.repository");

    class DeleteCategoryService {
    async execute(targetCategoryId) {
        const category = await CategoryRepository.findById(targetCategoryId);
        if (!category) {
            throw new Error("Category not found.");
        }
        await CategoryRepository.softDelete(targetCategoryId);
        return category;
    }
}

module.exports = new DeleteCategoryService();