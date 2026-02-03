const UpdateUserService = require("../../core/services/update-user.service");

class UpdateUserController {
  async handle(req, res) {
    const targetUserId = req.params.id;
    const loggedUser = req.user; // payload do token

    try {
      const User = await UpdateUserService.execute(targetUserId, loggedUser, req.body);
      return res.status(200).json(User);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UpdateUserController();
