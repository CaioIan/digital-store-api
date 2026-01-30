class LoginResponseDTO {
  constructor({ token, user }) {
    this.token = token;
    this.user = {
      id: user.id,
      firstname: user.firstname,
      surname: user.surname,
      email: user.email,
    };
  }
}

module.exports = LoginResponseDTO;
