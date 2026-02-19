const DeleteProductService = require("../../core/services/delete-product.service");

class DeleteProductController {
    async handle(req, res) {

        try {
            const targetProductId = req.params.id;

            await DeleteProductService.execute(targetProductId);

            return res.status(204).send();
        } catch (error) {
             if (error.message === 'Product not found') {
                return res.status(404).json({ error: error.message });
            }
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new DeleteProductController();