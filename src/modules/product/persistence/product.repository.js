const { Product, ProductImage, ProductOption, Category, sequelize } = require("../../../models/");
const { processImage } = require("../../../shared/utils/image.utils");

class ProductRepository {
  async createProduct({ productData, images, options, categoryIds }) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Cria o produto
      const createdProduct = await Product.create(productData, { transaction });

      // 2. Processa e cria as imagens (upload para Cloudinary)
      if (images && images.length > 0) {
        const imageRecords = [];
        for (const image of images) {
          const path = await processImage(image.content, image.type);
          imageRecords.push({
            product_id: createdProduct.id,
            enabled: true,
            path,
          });
        }
        await ProductImage.bulkCreate(imageRecords, { transaction });
      }

      // 3. Cria as opções (serializa values como JSON string)
      if (options && options.length > 0) {
        const optionRecords = options.map((option) => ({
          product_id: createdProduct.id,
          title: option.title,
          shape: option.shape || "square",
          radius: option.radius || 0,
          type: option.type || "text",
          values: JSON.stringify(option.values || []),
          category_id: null,
        }));
        await ProductOption.bulkCreate(optionRecords, { transaction });
      }

      // 4. Associa as categorias (belongsToMany)
      if (categoryIds && categoryIds.length > 0) {
        await createdProduct.setCategories(categoryIds, { transaction });
      }

      await transaction.commit();

      // 5. Retorna o produto completo com relações
      const fullProduct = await Product.findByPk(createdProduct.id, {
        include: [
          { model: ProductImage, as: "images" },
          { model: ProductOption, as: "options" },
          { model: Category, as: "categories", attributes: ["id"] },
        ],
      });

      return fullProduct;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new ProductRepository();