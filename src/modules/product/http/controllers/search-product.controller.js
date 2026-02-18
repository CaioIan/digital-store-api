const SearchProductService = require("../../core/services/search-product.service");
const SearchProductResponseDto = require("../dto/response/search-product.response.dto");

class SearchProductController {
  async handle(req, res) {
    try {
      const { 
        page, 
        limit, 
        fields, 
        match, 
        category_ids, 
        "price-range": priceRange, 
        option 
      } = req.query;

      const result = await SearchProductService.execute({
        page,
        limit,
        fields,
        match,
        category_ids,
        priceRange,
        option,
      });

      return res.status(200).json(SearchProductResponseDto.toResponse(result));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SearchProductController();