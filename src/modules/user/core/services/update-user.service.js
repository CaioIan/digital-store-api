const userRepository = require("../../persistence/user.repository");
const UpdateUserResponseDto = require("../../http/dto/response/update-user.response.dto");

class UpdateUserService {
  async execute(targetUserId, loggedUser, updateData) {
    // Admin pode atualizar qualquer usuário
    if (loggedUser.role === "ADMIN") {
      const user = await userRepository.updateUser(targetUserId, updateData);
      if (!user) {
        throw new Error("Acesso negado ou recurso não disponível.");
      }
      return new UpdateUserResponseDto({
        id: user.id,
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    }

    if (String(loggedUser.sub) === String(targetUserId)) {
      const user = await userRepository.updateUser(targetUserId, updateData);
      if (!user) {
        throw new Error("Acesso negado ou recurso não disponível.");
      }
      return new UpdateUserResponseDto({
        id: user.id,
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    }

    throw new Error("Acesso negado ou recurso não disponível.");
  }
}

module.exports = new UpdateUserService();
