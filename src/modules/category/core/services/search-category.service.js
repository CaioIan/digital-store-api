const CategoryRepository = require("../../persistence/category.repository");

class SearchCategoryService {
  /**
   * Orquestra a busca de categorias.
   * Os dados chegam aqui já tipados e transformados pelo Validator.
   */
  async execute(params) {
    // Apenas repassa os dados limpos para a camada de persistência
    const { data, total } = await CategoryRepository.searchCategories(params);

    return {
      data,
      total,
      limit: params.limit,
      page: params.page,
    };
  }
}

module.exports = new SearchCategoryService();
