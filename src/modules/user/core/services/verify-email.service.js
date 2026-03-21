const AppError = require("../../../../shared/errors/app-error");
const { verifyToken } = require("../../../../shared/auth/jwt");
const userRepository = require("../../persistence/user.repository");
const { User } = require("../../../../models");

class VerifyEmailService {
  /**
   * Valida o token recebido e marca o email do usuário como verificado.
   * @param {string} token - JWT Token gerado na criação do usuário.
   */
  async execute(token) {
    if (!token) {
      throw new AppError("Token de verificação não fornecido", 400);
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.sub) {
      throw new AppError("Token de verificação inválido ou expirado", 400);
    }

    const userId = decoded.sub;
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (user.is_verified) {
      throw new AppError("Endereço de email já foi verificado anteriormente", 400);
    }

    await User.update({ is_verified: true }, { where: { id: userId } });
    
    return true;
  }
}

module.exports = new VerifyEmailService();
