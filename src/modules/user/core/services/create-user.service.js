const userRepository = require("../../persistence/user.repository");
const CreateUserResponseDTO = require("../../http/dto/response/create-user.response.dto");

// Segurança: nunca aceite 'role' do body, sempre defina no repository
class CreateUserService {
  async execute({ firstname, surname, email, password, confirmPassword }) {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
    // Não passe 'role' do body, será sempre USER no repository
    const user = await userRepository.create({ firstname, surname, email, password });
    const response = CreateUserResponseDTO.parse({ user });
    return response;
  }
}

module.exports = new CreateUserService();
