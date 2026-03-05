const ListUserOrdersService = require("../../core/services/list-user-orders.service");
const ListUserOrdersResponseDto = require("../dto/list-user-orders.response.dto");

class ListUserOrdersController {
  async handle(req, res) {
    const userId = req.user.sub;
    const { limit, page } = req.query;

    const result = await ListUserOrdersService.execute(userId, limit, page);

    const dto = {
      data: ListUserOrdersResponseDto.fromDomain(result.data),
      total: result.total,
      limit: result.limit,
      page: result.page,
    };

    return res.status(200).json(dto);
  }
}

module.exports = new ListUserOrdersController();
