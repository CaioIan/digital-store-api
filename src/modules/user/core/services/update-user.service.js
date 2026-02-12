const userRepository = require("../../persistence/user.repository");

class UpdateUserService {
  async execute(targetUserId, loggedUser, updateData) {
    // Admin pode atualizar qualquer usuário
    if (loggedUser.role === "ADMIN") {
      const user = await userRepository.updateUser(targetUserId, updateData);
      if (!user) {
        throw new Error("Acesso negado ou recurso não disponível.");
      }
      return user;
    }

    if (String(loggedUser.sub) === String(targetUserId)) {
      const user = await userRepository.updateUser(targetUserId, updateData);
      if (!user) {
        throw new Error("Acesso negado ou recurso não disponível.");
      }
      return user;
    }

    throw new Error("Acesso negado ou recurso não disponível.");
  }
}

module.exports = new UpdateUserService();
