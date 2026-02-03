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
      const response = UpdateUserResponseDto.parse({ user });
      return response;
    }

    if (String(loggedUser.sub) === String(targetUserId)) {
      const user = await userRepository.updateUser(targetUserId, updateData);
      if (!user) {
        throw new Error("Acesso negado ou recurso não disponível.");
      }
      const response = UpdateUserResponseDto.parse({ user });
      return response;
    }

    throw new Error("Acesso negado ou recurso não disponível.");
  }
}

module.exports = new UpdateUserService();
