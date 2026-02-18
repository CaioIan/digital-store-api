const UpdateProductService = require("../../core/services/update-product.service")
class UpdateProductController {
    async handle(req, res) {

        try {
            const targetProductId = req.params.id;
            const body = req.body;

            const updatedProduct = await UpdateProductService.execute(targetProductId, body);
            return res.status(200).json(updatedProduct);
            
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }

    }
}

module.exports = new UpdateProductController();