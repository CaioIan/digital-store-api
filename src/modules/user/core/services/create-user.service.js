const userRepository = require('../../persistence/user.repository');
const CreateUserResponseDTO = require('../../http/dto/create-user.response.dto');

class CreateUserService {
  async execute({ firstname, surname, email, password, confirmPassword }) {
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    const user = await userRepository.create({ firstname, surname, email, password });
    return new CreateUserResponseDTO({ id: user.id, firstname: user.firstname, surname: user.surname, email: user.email });
  }
}

module.exports = new CreateUserService();
