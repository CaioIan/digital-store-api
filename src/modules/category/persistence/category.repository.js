const { Category, Sequelize } = require("../../../models");

class CategoryRepository {
  async create(data) {
    const createdCategory = await Category.create(data);
    return createdCategory;
  }

  async findByNameOrSlug(name, slug) {
    return await Category.findOne({
      where: {
        [Sequelize.Op.or]: [{ name }, { slug }],
      },
    });
  }

  async findById(id) {
    const category = await Category.findByPk(id);
    return category;
  }

  async searchCategories({ limit, page, fields, use_in_menu } = {}) {
    // Construção dinâmica do WHERE e ATTRIBUTES de forma mais limpa
    const queryOptions = {
      where: use_in_menu === true ? { use_in_menu: 1 } : {},
      raw: true,
      nest: true,
    };

    // Lógica de Projeção (Garante ID)
    if (fields?.length) {
      queryOptions.attributes = fields.includes("id") ? fields : ["id", ...fields];
    }

    // Normalização defensiva (mesmo com validator, protege o repositório)
    const safeLimit = parseInt(limit, 10) || 12;
    const safePage = parseInt(page, 10) || 1;

    // Lógica de Paginação
    if (safeLimit !== -1) {
      queryOptions.limit = safeLimit;
      queryOptions.offset = (Math.max(safePage, 1) - 1) * safeLimit;
    }

    const { count, rows } = await Category.findAndCountAll(queryOptions);

    return { data: rows, total: count };
  }

  async update(id, data) {
    const [updated] = await Category.update(data, { where: { id } });
    if (!updated) return null;
    return await this.findById(id);
  }
}

module.exports = new CategoryRepository();
