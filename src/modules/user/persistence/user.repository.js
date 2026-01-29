const { User } = require("../../../models");

class UserRepository {
  async create({ firstname, surname, email, password }) {
    const user = await User.create({ firstname, surname, email, password });
    return user;
  }

  async findById(userId) {
    const user = await User.findByPk(userId);
    return user;
  }
}

module.exports = new UserRepository();
