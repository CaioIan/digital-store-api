const GetOrderByIdService = require("../../core/services/get-order-by-id.service");
const GetOrderByIdResponseDto = require("../dto/get-order-by-id.response.dto");

class GetOrderByIdController {
  async handle(req, res) {
    const orderId = req.params.id;
    const userId = req.user.sub;

    const order = await GetOrderByIdService.execute(orderId, userId);

    const dto = GetOrderByIdResponseDto.fromDomain(order);

    return res.status(200).json(dto);
  }
}

module.exports = new GetOrderByIdController();
