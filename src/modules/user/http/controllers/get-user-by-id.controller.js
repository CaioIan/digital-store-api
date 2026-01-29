const GetUserByIdService = require("../../core/services/get-user-by-id.service");

class GetUserByIdController {
  async handle(req, res) {
    try {
      const userId = req.params.id;
      const user = await GetUserByIdService.execute({ userId });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new GetUserByIdController();
