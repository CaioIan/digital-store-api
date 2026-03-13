/**
 * DTO responsável por formatar a resposta da listagem de usuários para o Admin.
 * Remove campos sensíveis e normaliza a estrutura.
 */
class ListUsersResponseDto {
  /**
   * Converte a Model do Sequelize para o formato de resposta.
   * @param {Array} users - Lista de usuários vindos do repositório.
   * @returns {Array} Lista formatada.
   */
  static fromDomain(users) {
    return users.map((user) => ({
      id: user.id,
      firstname: user.firstname,
      surname: user.surname,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone,
      role: user.role,
      created_at: user.createdAt,
    }));
  }
}

module.exports = ListUsersResponseDto;
