const userRepository = require("../../persistence/user.repository");
const GetUserByIdResponseDTO = require("../../http/dto/response/get-user-by-id.response.dto");

class GetUserByIdService {
  async execute({ userId }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return new GetUserByIdResponseDTO({
      id: user.id,
      firstname: user.firstname,
      surname: user.surname,
      email: user.email,
    });
  }
}

module.exports = new GetUserByIdService();
