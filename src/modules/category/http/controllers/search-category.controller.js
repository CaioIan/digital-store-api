const SearchCategoryService = require("../../core/services/search-category.service");
const SearchCategoryResponseDto = require("../dto/response/search-category.response.dto");

class SearchCategoryController {
  async handle(req, res) {
    try {
      // Executa o serviço usando o req.query já validado
      const result = await SearchCategoryService.execute(req.query);

      // Formata e envia
      return res.status(200).json(SearchCategoryResponseDto.toResponse(result));
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
        message: error.message,
      });
    }
  }
}

module.exports = new SearchCategoryController();
