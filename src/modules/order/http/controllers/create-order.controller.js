const CreateOrderService = require("../../core/services/create-order.service");

class CreateOrderController {
  async handle(req, res) {
    // Controller lida com input/output via HTTP
    const userId = req.user.sub;
    const { personal_info, delivery_address, payment } = req.body;

    const { order_id } = await CreateOrderService.execute({
      user_id: userId,
      personal_info,
      delivery_address,
      payment,
    });

    return res.status(201).json({
      message: "Pedido criado com sucesso",
      order_id,
    });
  }
}

module.exports = new CreateOrderController();
