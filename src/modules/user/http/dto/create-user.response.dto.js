// DTO para response de criação de usuário
class CreateUserResponseDTO {
  constructor({ id, firstname, surname, email }) {
    this.id = id;
    this.firstname = firstname;
    this.surname = surname;
    this.email = email;
  }
}

module.exports = CreateUserResponseDTO;
