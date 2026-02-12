const userRepository = require("../../persistence/user.repository");

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
      return user;
    }

    // User só pode buscar o próprio id
    if (String(loggedUser.sub) === String(targetUserId)) {
      const user = await userRepository.findById(targetUserId);
      if (!user) {
        throw new Error("Acesso negado ou recurso não disponível.");
      }
      return user;
    }

    // Qualquer outro caso: acesso negado
    throw new Error("Acesso negado ou recurso não disponível.");
  }
}

module.exports = new GetUserByIdService();
