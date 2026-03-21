const AppError = require("../../../../shared/errors/app-error");
const bcrypt = require("bcrypt");
const userRepository = require("../../persistence/user.repository");
const { generateToken } = require("../../../../shared/auth/jwt");

/**
 * Service responsável pela autenticação de usuários.
 * Valida as credenciais e gera um token JWT em caso de sucesso.
 */
class LoginService {
  /**
   * Autentica um usuário por e-mail e senha.
   * Retorna um token JWT e informações básicas do usuário em caso de sucesso.
   * Utiliza mensagens de erro genéricas para prevenir enumeração de usuários.
   * @param {Object} credentials - Credenciais de autenticação.
   * @param {string} credentials.email - Endereço de e-mail do usuário.
   * @param {string} credentials.password - Senha em texto plano do usuário.
   * @returns {Promise<Object>} Objeto contendo o token JWT e dados do usuário.
   * @throws {AppError} 401 - Se as credenciais forem inválidas (e-mail ou senha incorretos).
   */
  async execute({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("Credenciais inválidas", 401);
    }

    if (!user.is_verified) {
      throw new AppError("Por favor, verifique seu email antes de fazer login", 401);
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new AppError("Credenciais inválidas", 401);
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

module.exports = new LoginService();
