const GetProductByIdService = require("../../core/services/get-product-by-id.service");
const GetProductByIdResponseDto = require("../dto/response/get-product-by-id.response.dto");

class GetProductByIdController {
    async handle(req, res) {
        try {
            const targetProductId = req.params.id;
            const product = await GetProductByIdService.execute(targetProductId);

            return res.status(200).json(GetProductByIdResponseDto.toResponse(product));
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new GetProductByIdController();