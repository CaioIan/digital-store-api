const { Product, ProductImage, ProductOption, Category, sequelize, Sequelize } = require("../../../models/");
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

      // 5. Retorna o produto completo com relações
      const fullProduct = await Product.findByPk(createdProduct.id, {
        include: [
          { model: ProductImage, as: "images" },
          { model: ProductOption, as: "options" },
          { model: Category, as: "categories", attributes: ["id"] },
        ],
        transaction, // Garante que lê da transação atual
      });

      await transaction.commit();

      return fullProduct;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async searchProducts({ limit, page, fields, match, category_ids, priceRange, option } = {}) {
    const queryOptions = {
      where: {},
      include: [],
      distinct: true, // Importante para contar produtos corretamente com includes many-to-many
    };

    // 1. Paginação
    const safeLimit = parseInt(limit, 10) || 12;
    const safePage = parseInt(page, 10) || 1;

    if (safeLimit !== -1) {
      queryOptions.limit = safeLimit;
      queryOptions.offset = (Math.max(safePage, 1) - 1) * safeLimit;
    }

    // 2. Projeção (fields)
    queryOptions.attributes = ["id", "name", "slug", "price", "price_with_discount", "description", "enabled", "stock", "use_in_menu"]; // Default attributes
    if (fields) {
      const requestedFields = fields.split(",").map((f) => f.trim());
      // Garante que ID sempre venha para montar as relações se necessário, ou lógica de frontend
      if (!requestedFields.includes("id")) requestedFields.unshift("id");
      queryOptions.attributes = requestedFields;
    }

    // 3. Filtros
    // 3.1 Match (nome ou descrição)
    if (match) {
      queryOptions.where[Sequelize.Op.or] = [
        { name: { [Sequelize.Op.like]: `%${match}%` } },
        { description: { [Sequelize.Op.like]: `%${match}%` } },
      ];
    }

    // 3.2 Category IDs
    if (category_ids) {
      const ids = category_ids.split(",").map((id) => id.trim());
      queryOptions.include.push({
        model: Category,
        as: "categories",
        where: { id: { [Sequelize.Op.in]: ids } },
        attributes: ["id", "name", "slug"],
        through: { attributes: [] }, // Não trazer dados da tabela pivo
      });
    } else {
      // Se não filtrar, ainda pode querer trazer as categorias? 
      // O padrão REST costuma trazer relacionamentos apenas se solicitado ou by default.
      // Vamos trazer para ficar completo, mas sem filtro WHERE.
       queryOptions.include.push({
        model: Category,
        as: "categories",
        attributes: ["id", "name", "slug"],
        through: { attributes: [] },
      });
    }

    // 3.3 Price Range
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        queryOptions.where.price = { [Sequelize.Op.between]: [min, max] };
      }
    }

    // 3.4 Options
    // Ex: option[45]=GG,PP -> option ID 45, values "GG" OR "PP"
    // Como os values são salvos como string JSON '["GG", "PP"]', usamos LIKE.
    if (option) {
      const optionConditions = [];
      
      for (const [optionId, valuesString] of Object.entries(option)) {
        const values = valuesString.split(",");
        const valueConditions = values.map((val) => ({
             values: { [Sequelize.Op.like]: `%${val}%` }
        }));

        optionConditions.push({
          id: optionId,
          [Sequelize.Op.or]: valueConditions
        });
      }

      if (optionConditions.length > 0) {
        queryOptions.include.push({
          model: ProductOption,
          as: "options",
          where: {
            [Sequelize.Op.and]: optionConditions
          },
            attributes: ["id", "title", "values"]
        });
      }
    } else {
         // Inclui options mesmo sem filtro para retorno rico
         queryOptions.include.push({
            model: ProductOption,
            as: "options",
            attributes: ["id", "title", "values", "shape", "radius", "type"]
        });
    }
    
    // Sempre incluir imagens
    queryOptions.include.push({
        model: ProductImage,
        as: "images",
        attributes: ["id", "path", "enabled"]
    });

    const { count, rows } = await Product.findAndCountAll(queryOptions);

    return {
      data: rows,
      total: count,
      limit: safeLimit,
      page: safePage,
    };
  }

  async findById(targetProductId) {
    const product = await Product.findByPk(targetProductId, {
      include: [
        { model: ProductImage, as: "images" },
        { model: ProductOption, as: "options" },
        { model: Category, as: "categories", attributes: ["id", "name", "slug"] },
      ],
    });

    return product;
  }

  async updateProduct(targetProductId, body) {
    const transaction = await sequelize.transaction();
    try {
      // 1. Atualiza dados básicos do produto
      await Product.update(body, {
        where: { id: targetProductId },
        transaction,
      });

      const product = await Product.findByPk(targetProductId, { transaction });

      // 2. Atualiza Imagens (Se fornecido, substitui todas)
      if (body.images) {
        await ProductImage.destroy({ where: { product_id: targetProductId }, transaction });
        
        if (body.images.length > 0) {
          const imageRecords = [];
          for (const image of body.images) {
             const path = await processImage(image.content, image.type);
             imageRecords.push({
               product_id: targetProductId,
               enabled: true,
               path,
             });
          }
          await ProductImage.bulkCreate(imageRecords, { transaction });
        }
      }

      // 3. Atualiza Opções (Se fornecido, substitui todas)
      if (body.options) {
        await ProductOption.destroy({ where: { product_id: targetProductId }, transaction });

        if (body.options.length > 0) {
          const optionRecords = body.options.map((option) => ({
            product_id: targetProductId,
            title: option.title,
            shape: option.shape || "square",
            radius: option.radius || 0,
            type: option.type || "text",
            values: JSON.stringify(option.values || []),
            category_id: null,
          }));
          await ProductOption.bulkCreate(optionRecords, { transaction });
        }
      }

      // 4. Atualiza Categorias (Se fornecido, substitui)
      if (body.category_ids) {
        await product.setCategories(body.category_ids, { transaction });
      }

      await transaction.commit();

      return this.findById(targetProductId);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteProduct(targetProductId) {
    const transaction = await sequelize.transaction();
    try {
        const product = await Product.findByPk(targetProductId);
        
        if (!product) {
            throw new Error('Product not found');
        }

        // Hard Delete - devido ao CASCADE configurado nas migrations, 
        // as imagens e options serão deletadas automaticamente pelo banco
        await product.destroy({ transaction });

        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
  }
}

module.exports = new ProductRepository();