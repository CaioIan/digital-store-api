const GetUserProfileService = require("../../core/services/get-user-profile.service");
const GetUserProfileResponseDto = require("../dto/response/get-user-profile.response.dto");

class GetUserProfileController {
  async handle(req, res) {
    const userId = req.user.sub;

    const user = await GetUserProfileService.execute(userId);

    const dto = GetUserProfileResponseDto.fromDomain(user);

    return res.status(200).json(dto);
  }
}

module.exports = new GetUserProfileController();
