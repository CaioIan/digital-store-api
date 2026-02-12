const bcrypt = require("bcrypt");
const userRepository = require("../../persistence/user.repository");
const { generateToken } = require("../../../../shared/auth/jwt");
const LoginResponseDto = require("../../http/dto/response/login.response.dto");

class LoginService {
  async execute({ email, password }) {
    // Buscar usuário por email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Credenciais inválidas");
    }
    // Validar senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error("Credenciais inválidas");
    }
    // Gerar token JWT
    const token = generateToken({ sub: user.id, role: user.role });
    
     return {
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
      },
    };
  }
}

module.exports = new LoginService();
