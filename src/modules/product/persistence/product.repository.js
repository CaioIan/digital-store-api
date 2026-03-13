const { Product, ProductImage, ProductOption, Category, sequelize, Sequelize } = require("../../../models/");

/**
 * Repositório responsável pelo acesso a dados de produtos.
 * Encapsula todas as operações de persistência usando os models Sequelize.
 * Gerencia transações para operações que envolvem múltiplas tabelas.
 */
class ProductRepository {
  /**
   * Busca um produto pelo nome ou slug (verificação de duplicidade).
   * @param {string} name - Nome do produto.
   * @param {string} slug - Slug do produto.
   * @returns {Promise<Object|null>} O produto encontrado ou null.
   */
  async findByNameOrSlug(name, slug) {
    return await Product.findOne({
      where: {
        [Sequelize.Op.or]: [{ name }, { slug }],
      },
    });
  }

  /**
   * Cria um novo produto com imagens, opções e categorias em uma transação atômica.
   * @param {Object} params - Dados de criação.
   * @param {Object} params.productData - Dados básicos do produto.
   * @param {string[]} params.images - URLs das imagens já processadas.
   * @param {Object[]} params.options - Opções do produto (title, shape, radius, type, values).
   * @param {string[]} params.categoryIds - UUIDs das categorias a serem associadas.
   * @returns {Promise<Object>} O produto criado com todas as relações carregadas.
   */
  async createProduct({ productData, images, options, categoryIds }) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Cria o produto
      const createdProduct = await Product.create(productData, { transaction });

      // 2. Cria os registros de imagens (URLs já processadas pelo service)
      if (images && images.length > 0) {
        const imageRecords = images.map((url) => ({
          product_id: createdProduct.id,
          enabled: true,
          path: url,
        }));
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
        transaction,
      });

      await transaction.commit();

      return fullProduct;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Busca produtos com filtros avançados e paginação.
   * Suporta filtros por nome/descrição, categorias, faixa de preço e opções.
   * @param {Object} params - Parâmetros de busca.
   * @param {number} [params.limit=12] - Limite de itens por página (-1 para todos).
   * @param {number} [params.page=1] - Número da página.
   * @param {string} [params.fields] - Campos a serem retornados (separados por vírgula).
   * @param {string} [params.match] - Termo de busca para nome ou descrição.
   * @param {string} [params.brand] - Filtro de marca (Case Insensitive no MySQL).
   * @param {string} [params.gender] - Filtro de gênero (Estrito no Enum).
   * @param {string} [params.category_ids] - IDs das categorias (separados por vírgula).
   * @param {string} [params.priceRange] - Faixa de preço no formato "min-max".
   * @param {Object} [params.option] - Filtros de opções (ex: { "45": "GG,PP" }).
   * @returns {Promise<{data: Object[], total: number, limit: number, page: number}>} Resultado paginado.
   */
  async searchProducts({ limit, page, fields, match, brand, gender, category_ids, priceRange, option } = {}) {
    const queryOptions = {
      where: {},
      include: [],
      distinct: true,
    };

    // 1. Paginação
    const safeLimit = parseInt(limit, 10) || 12;
    const safePage = parseInt(page, 10) || 1;

    if (safeLimit !== -1) {
      queryOptions.limit = safeLimit;
      queryOptions.offset = (Math.max(safePage, 1) - 1) * safeLimit;
    }

    // 2. Projeção de campos
    queryOptions.attributes = [
      "id",
      "name",
      "slug",
      "price",
      "price_with_discount",
      "description",
      "brand",
      "gender",
      "enabled",
      "stock",
      "use_in_menu",
    ];
    if (fields) {
      const requestedFields = fields.split(",").map((f) => f.trim());
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
    
    // 3.1.2 Brand
    if (brand) {
      queryOptions.where.brand = brand;
    }

    // 3.1.3 Gender
    if (gender) {
      queryOptions.where.gender = gender;
    }

    // 3.2 Categorias
    if (category_ids) {
      const ids = category_ids.split(",").map((id) => id.trim());
      queryOptions.include.push({
        model: Category,
        as: "categories",
        where: { id: { [Sequelize.Op.in]: ids } },
        attributes: ["id", "name", "slug"],
        through: { attributes: [] },
      });
    } else {
      queryOptions.include.push({
        model: Category,
        as: "categories",
        attributes: ["id", "name", "slug"],
        through: { attributes: [] },
      });
    }

    // 3.3 Faixa de preço
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        queryOptions.where.price = { [Sequelize.Op.between]: [min, max] };
      }
    }

    // 3.4 Opções do produto (ex: option[45]=GG,PP)
    if (option) {
      const optionConditions = [];

      for (const [optionId, valuesString] of Object.entries(option)) {
        const values = valuesString.split(",");
        const valueConditions = values.map((val) => ({
          values: { [Sequelize.Op.like]: `%${val}%` },
        }));

        optionConditions.push({
          id: optionId,
          [Sequelize.Op.or]: valueConditions,
        });
      }

      if (optionConditions.length > 0) {
        queryOptions.include.push({
          model: ProductOption,
          as: "options",
          where: {
            [Sequelize.Op.and]: optionConditions,
          },
          required: true,
          attributes: ["id", "title", "values", "shape", "radius", "type"],
        });
      }
    } else {
      queryOptions.include.push({
        model: ProductOption,
        as: "options",
        attributes: ["id", "title", "values", "shape", "radius", "type"],
      });
    }

    // Sempre incluir imagens
    queryOptions.include.push({
      model: ProductImage,
      as: "images",
      attributes: ["id", "path", "enabled"],
    });

    // 4. Ordenação global e de relações
    queryOptions.order = [[{ model: ProductImage, as: "images" }, "id", "ASC"]];

    const { count, rows } = await Product.findAndCountAll(queryOptions);

    return {
      data: rows,
      total: count,
      limit: safeLimit,
      page: safePage,
    };
  }

  /**
   * Busca um produto pelo seu identificador primário, incluindo relações.
   * @param {number} targetProductId - ID numérico do produto.
   * @returns {Promise<Object|null>} O produto com imagens, opções e categorias, ou null.
   */
  async findById(targetProductId) {
    const product = await Product.findByPk(targetProductId, {
      include: [
        { model: ProductImage, as: "images" },
        { model: ProductOption, as: "options" },
        { model: Category, as: "categories", attributes: ["id", "name", "slug"] },
      ],
      order: [[{ model: ProductImage, as: "images" }, "id", "ASC"]],
    });

    return product;
  }

  /**
   * Atualiza um produto existente em uma transação atômica.
   * Substitui imagens, opções e categorias se fornecidas.
   * @param {number} targetProductId - ID numérico do produto.
   * @param {Object} body - Dados de atualização (campos opcionais).
   * @returns {Promise<Object>} O produto atualizado com suas relações.
   */
  async updateProduct(targetProductId, body) {
    const transaction = await sequelize.transaction();
    try {
      // 1. Extrai apenas os campos que pertencem à tabela 'products'
      const { images, options, category_ids, ...productData } = body;

      // 2. Atualiza apenas dados básicos do produto
      await Product.update(productData, {
        where: { id: targetProductId },
        transaction,
      });

      const product = await Product.findByPk(targetProductId, { transaction });

      // 2. Atualiza imagens (substitui todas se fornecido — URLs já processadas pelo service)
      if (body.images) {
        await ProductImage.destroy({ where: { product_id: targetProductId }, transaction });

        if (body.images.length > 0) {
          const imageRecords = body.images.map((url) => ({
            product_id: targetProductId,
            enabled: true,
            path: url,
          }));
          await ProductImage.bulkCreate(imageRecords, { transaction });
        }
      }

      // 3. Atualiza opções (substitui todas se fornecido)
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

      // 4. Atualiza categorias (substitui se fornecido)
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

  /**
   * Realiza o hard delete de um produto em uma transação atômica.
   * Imagens e opções são deletadas automaticamente via CASCADE do banco.
   * @param {number} targetProductId - ID numérico do produto.
   * @returns {Promise<boolean|null>} true se deletado, null se não encontrado.
   */
  async deleteProduct(targetProductId) {
    const transaction = await sequelize.transaction();
    try {
      const product = await Product.findByPk(targetProductId);

      if (!product) {
        await transaction.rollback();
        return null;
      }

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
