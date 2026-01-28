
const CreateUserService = require('../../core/services/create-user.service');

class CreateUserController {
  async handle(req, res) {
    try {
      const user = await CreateUserService.execute(req.body);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CreateUserController();
