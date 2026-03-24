const UpdateUserAddressService = require("../../core/services/update-user-address.service");
const UpdateUserAddressResponseDto = require("../dto/response/update-user-address.response.dto");

class UpdateUserAddressController {
  async handle(req, res) {
    const userId = req.user.sub;

    const updatedUser = await UpdateUserAddressService.execute(userId, req.body);

    const dto = UpdateUserAddressResponseDto.fromDomain(updatedUser);

    return res.status(200).json(dto);
  }
}

module.exports = new UpdateUserAddressController();
