const ProductRepository = require('../../persistence/product.repository');

class DeleteProductService {
    async execute(targetProductId) {
       // O repository já faz a verificação se existe, então podemos chamar direto.
       // Mas para manter a lógica de negócio explícita, podemos checar antes ou deixar o erro propagar.
       // O repository lança erro se não encontrar.
       
       await ProductRepository.deleteProduct(targetProductId);
       
       return true;
    }
}

module.exports = new DeleteProductService();