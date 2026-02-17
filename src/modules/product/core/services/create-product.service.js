const ProductRepository = require("../../persistence/product.repository");
const { Category, Product } = require("../../../../models/");

class CreateProductService {
  async execute(data) {
    const {
      category_ids = [],
      images = [],
      options = [],
      enabled = false,
      stock = 0,
      use_in_menu = false,
      description = null,
      price_with_discount,
      ...rest
    } = data;

    const productData = {
      ...rest,
      enabled,
      stock,
      use_in_menu,
      description,
      // Se price_with_discount vazio, usa o preço original (0% desconto)
      price_with_discount: price_with_discount !== undefined ? price_with_discount : rest.price,
    };

    // Verifica se já existe produto com o mesmo nome ou slug
    const existing = await Product.findOne({
      where: {
        [require("sequelize").Op.or]: [
          { name: productData.name },
          { slug: productData.slug },
        ],
      },
    });

    if (existing) {
      throw new Error("Produto já existe (nome ou slug duplicado)");
    }

    // Valida que todas as categorias existem
    if (category_ids.length > 0) {
      const categories = await Category.findAll({
        where: { id: category_ids },
      });

      if (categories.length !== category_ids.length) {
        const foundIds = categories.map((c) => c.id);
        const notFound = category_ids.filter((id) => !foundIds.includes(id));
        throw new Error(`Categorias não encontradas: ${notFound.join(", ")}`);
      }
    }

    const product = await ProductRepository.createProduct({
      productData,
      images,
      options,
      categoryIds: category_ids,
    });

    return product;
  }
}

module.exports = new CreateProductService();