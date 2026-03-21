const { User, UserAddress, sequelize } = require("../../../models");

/**
 * Repositório responsável por todas as operações de acesso a dados de Usuário.
 * Realiza interações diretas com o banco de dados, sem lógica de negócio.
 */
class UserRepository {
  /**
   * Cria um novo usuário com a role forçada para 'USER'.
   * Se dados de endereço forem fornecidos, cria o endereço na mesma transação.
   * O campo role nunca é aceito de entrada externa para prevenir escalação de privilégios.
   * @param {Object} userData - Dados do usuário a ser criado.
   * @param {string} userData.firstname - Primeiro nome do usuário.
   * @param {string} userData.surname - Sobrenome do usuário.
   * @param {string} userData.cpf - CPF do usuário.
   * @param {string} userData.phone - Telefone do usuário.
   * @param {string} userData.email - Endereço de e-mail do usuário.
   * @param {string} userData.password - Senha do usuário (será hasheada pelo model).
   * @param {Object|null} addressData - Dados de endereço de entrega (opcional).
   * @returns {Promise<Object>} O registro do usuário criado com endereços incluídos.
   */
  async create({ firstname, surname, cpf, phone, email, password }, addressData = null) {
    const result = await sequelize.transaction(async (t) => {
      const user = await User.create(
        { firstname, surname, cpf, phone, email, password, role: "USER" },
        { transaction: t },
      );

      if (addressData) {
        await UserAddress.create(
          { ...addressData, user_id: user.id },
          { transaction: t },
        );
      }

      return await User.findByPk(user.id, {
        include: [{ model: UserAddress, as: "addresses" }],
        transaction: t,
      });
    });

    return result;
  }

  /**
   * Busca um usuário pela chave primária (ID), excluindo registros com soft-delete.
   * Inclui os endereços cadastrados do usuário.
   * @param {string} targetUserId - UUID do usuário a ser buscado.
   * @returns {Promise<Object|null>} O registro do usuário ou null se não encontrado.
   */
  async findById(targetUserId) {
    const user = await User.findByPk(targetUserId, {
      where: { deleted_at: null },
      include: [{ model: UserAddress, as: "addresses" }],
    });
    return user;
  }

  /**
   * Busca um usuário pelo endereço de e-mail, excluindo registros com soft-delete.
   * @param {string} email - Endereço de e-mail a ser pesquisado.
   * @returns {Promise<Object|null>} O registro do usuário ou null se não encontrado.
   */
  async findByEmail(email) {
    const user = await User.findOne({
      where: {
        email,
        deleted_at: null,
      },
    });
    return user;
  }

  /**
   * Busca usuários que já possem o mesmo e-mail, cpf ou telefone.
   */
  async findConflictingUsers(email, cpf, phone) {
    const { Op } = require("sequelize");
    return await User.findAll({
      where: {
        [Op.or]: [{ email }, { cpf }, { phone }],
        deleted_at: null,
      },
    });
  }

  /**
   * Atualiza o firstname e/ou surname de um usuário.
   * Permite apenas campos permitidos (whitelist) para prevenir mass assignment.
   * @param {string} targetUserId - UUID do usuário a ser atualizado.
   * @param {Object} updateData - Campos a serem atualizados.
   * @param {string} [updateData.firstname] - Novo primeiro nome.
   * @param {string} [updateData.surname] - Novo sobrenome.
   * @returns {Promise<Object|null>} O registro atualizado ou null se nenhuma linha foi afetada.
   */
  async updateUser(targetUserId, updateData) {
    const filteredData = {};
    if (updateData.firstname !== undefined) {
      filteredData.firstname = updateData.firstname;
    }
    if (updateData.surname !== undefined) {
      filteredData.surname = updateData.surname;
    }
    const [updated] = await User.update(filteredData, { where: { id: targetUserId } });
    if (!updated) return null;
    return await this.findById(targetUserId);
  }

  /**
   * Realiza um soft-delete definindo o campo deleted_at com a data atual.
   * Afeta apenas usuários que ainda não foram deletados previamente.
   * @param {string} targetUserId - UUID do usuário a ser soft-deletado.
   * @returns {Promise<boolean>} True se um registro foi atualizado, false caso contrário.
   */
  async softDelete(targetUserId) {
    const [updated] = await User.update({ deleted_at: new Date() }, { where: { id: targetUserId, deleted_at: null } });
    return updated > 0;
  }
  /**
   * Cria ou atualiza o endereço de entrega de um usuário.
   * Se já existir um endereço, atualiza-o. Caso contrário, cria um novo.
   * @param {string} userId - UUID do usuário.
   * @param {Object} addressData - Dados do endereço (endereco, bairro, cidade, estado, cep, complemento).
   * @returns {Promise<Object>} O usuário atualizado com endereços incluídos.
   */
  async upsertAddress(userId, addressData) {
    const existingAddress = await UserAddress.findOne({
      where: { user_id: userId },
    });

    if (existingAddress) {
      await existingAddress.update(addressData);
    } else {
      await UserAddress.create({ ...addressData, user_id: userId });
    }

    return await this.findById(userId);
  }

  /**
   * Remove permanentemente (hard delete) um usuário.
   */
  async hardDelete(targetUserId) {
    await User.destroy({ where: { id: targetUserId }, force: true });
  }

  /**
   * Retorna todos os usuários (não deletados) com paginação.
   * @param {Object} options - Parâmetros de paginação.
   * @param {number} options.limit - Limite de itens (Default: 15).
   * @param {number} options.page - Página atual (Default: 1).
   * @returns {Promise<{data: Array, total: number, limit: number, page: number}>} Lista de usuários e metadados.
   */
  async findAll({ limit, page } = {}) {
    const safeLimit = parseInt(limit, 10) || 15;
    const safePage = parseInt(page, 10) || 1;

    const { count, rows } = await User.findAndCountAll({
      where: { deleted_at: null },
      attributes: { exclude: ["password"] }, // Nunca retornar senha na listagem
      limit: safeLimit,
      offset: (Math.max(safePage, 1) - 1) * safeLimit,
      order: [["created_at", "DESC"]],
    });

    return {
      data: rows,
      total: count,
      limit: safeLimit,
      page: safePage,
    };
  }
}

module.exports = new UserRepository();
