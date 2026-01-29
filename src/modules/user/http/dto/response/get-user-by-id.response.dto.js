// DTO para response de obtenção de usuário por ID
class GetUserByIdResponseDTO {
  constructor({ id, firstname, surname, email }) {
    this.id = id;
    this.firstname = firstname;
    this.surname = surname;
    this.email = email;
  }
}

module.exports = GetUserByIdResponseDTO;
