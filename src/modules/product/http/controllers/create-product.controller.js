const CreateProductService = require("../../core/services/create-product.service");
const CreateProductResponseDto = require("../dto/response/create-product.response.dto");

class CreateProductController {
    async handle(req, res) {
        try {
            const body = req.body;
            const createdProduct = await CreateProductService.execute(body);
            return res.status(201).json(CreateProductResponseDto.toResponse(createdProduct));
        } catch (error) {
            console.error("CreateProductController error:", error);
            return res.status(400).json({ error: error.message || "Erro ao criar produto" });
        }
    }
}

module.exports = new CreateProductController();