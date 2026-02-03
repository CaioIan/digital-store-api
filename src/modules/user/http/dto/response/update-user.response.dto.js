// src/modules/user/http/dto/response/update-user.response.dto.js
// DTO de resposta para atualização de usuário

class UpdateUserResponseDto {
  constructor({ id, firstname, surname, email, createdAt, updatedAt }) {
    this.id = id;
    this.firstname = firstname;
    this.surname = surname;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = UpdateUserResponseDto;
