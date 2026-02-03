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

  async updateUser(targetUserId, updateData) {
    // Permite alterar apenas os campos 'firstname' e 'surname'
    const filteredData = {};
    if (updateData.firstname !== undefined) {
      filteredData.firstname = updateData.firstname;
    }
    if (updateData.surname !== undefined) {
      filteredData.surname = updateData.surname;
    }
    const [updated] = await User.update(filteredData, { where: { id: targetUserId } });
    if (!updated) return null;
    return await User.findByPk(targetUserId);
  }
}

module.exports = new UserRepository();
