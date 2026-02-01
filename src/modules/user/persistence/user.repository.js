const { User } = require("../../../models");

class UserRepository {
  // Segurança: sempre define role como 'USER' no cadastro público, ignorando qualquer valor do cliente
  async create({ firstname, surname, email, password }) {
    const user = await User.create({ firstname, surname, email, password, role: "USER" });
    return user;
  }

  async findById(userId) {
    const user = await User.findByPk(userId);
    return user;
  }

  async findByEmail(email) {
    const user = await User.findOne({ where: { email } });
    return user;
  }
}

module.exports = new UserRepository();
