const AppError = require("../../../../shared/errors/app-error");
const bcrypt = require("bcrypt");
const userRepository = require("../../persistence/user.repository");
const { generateToken } = require("../../../../shared/auth/jwt");

/**
 * Service responsável pela autenticação de administradores.
 * Valida credenciais e garante que o usuário possui role ADMIN.
 * Utiliza mensagens de erro genéricas para credenciais inválidas.
 */
class AdminLoginService {
  /**
  * Autentica um usuário por e-mail e senha para acesso administrativo.
  * Só permite login quando a role do usuário for ADMIN.
   * @param {Object} credentials - Credenciais de autenticação.
   * @param {string} credentials.email - Endereço de e-mail do usuário.
   * @param {string} credentials.password - Senha em texto plano do usuário.
   * @returns {Promise<Object>} Objeto contendo o token JWT e dados básicos do usuário.
   * @throws {AppError} 401 - Se as credenciais forem inválidas.
   * @throws {AppError} 403 - Se o usuário não possuir role ADMIN.
   */
  async execute({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("Credenciais inválidas", 401);
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new AppError("Credenciais inválidas", 401);
    }

    if (user.role !== "ADMIN") {
      throw new AppError("Acesso negado: apenas administradores podem acessar esta área", 403);
    }

    const token = generateToken({ sub: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
      },
    };
  }
}

module.exports = new AdminLoginService();
