const userRepository = require("../../persistence/user.repository");
const GetUserByIdResponseDTO = require("../../http/dto/response/get-user-by-id.response.dto");

class GetUserByIdService {
  /**
   * @param {Object} params
   * @param {string} params.targetUserId - ID do usuário buscado
   * @param {Object} params.loggedUser - Dados do usuário logado extraídos do token (req.user)
   */
  async execute({ targetUserId, loggedUser }) {
    // Admin pode buscar qualquer usuário
    if (loggedUser.role === "ADMIN") {
      const user = await userRepository.findById(targetUserId);
      if (!user) {
        throw new Error("Acesso negado ou recurso não disponível.");
      }
      return new GetUserByIdResponseDTO({
        id: user.id,
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
      });
    }

    // User só pode buscar o próprio id
    if (String(loggedUser.sub) === String(targetUserId)) {
      const user = await userRepository.findById(targetUserId);
      if (!user) {
        throw new Error("Acesso negado ou recurso não disponível.");
      }
      return new GetUserByIdResponseDTO({
        id: user.id,
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
      });
    }

    // Qualquer outro caso: acesso negado
    throw new Error("Acesso negado ou recurso não disponível.");
  }
}

module.exports = new GetUserByIdService();
