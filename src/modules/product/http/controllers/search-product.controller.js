const ListProductsService = require("../../core/services/list-products.service");
const ListProductsResponseDto = require("../dto/response/list-products.response.dto");

class ListProductsController {
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

      const result = await ListProductsService.execute({
        page,
        limit,
        fields,
        match,
        category_ids,
        priceRange,
        option,
      });

      return res.status(200).json(ListProductsResponseDto.toResponse(result));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ListProductsController();