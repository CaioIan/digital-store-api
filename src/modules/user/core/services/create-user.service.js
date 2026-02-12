const userRepository = require("../../persistence/user.repository");

// Segurança: nunca aceite 'role' do body, sempre defina no repository
class CreateUserService {
  async execute({ firstname, surname, email, password, confirmPassword }) {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
    // Não passe 'role' do body, será sempre USER no repository
    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
      throw new Error("Este usuário já está cadastrado.");
    }
    const user = await userRepository.create({ firstname, surname, email, password });
    return user;
  }
}

module.exports = new CreateUserService();
