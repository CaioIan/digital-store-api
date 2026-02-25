const AppError = require("../../../../shared/errors/app-error");
const userRepository = require("../../persistence/user.repository");

/**
 * Service responsável pelo cadastro de novos usuários.
 * Valida confirmação de senha e unicidade de e-mail antes de criar.
 */
class CreateUserService {
  /**
   * Registra um novo usuário após validações.
   * O campo 'role' nunca é aceito de entrada externa — é sempre definido
   * como 'USER' na camada de repositório para prevenir escalação de privilégios.
   * @param {Object} data - Dados de cadastro.
   * @param {string} data.firstname - Primeiro nome do usuário.
   * @param {string} data.surname - Sobrenome do usuário.
   * @param {string} data.cpf - CPF do usuário.
   * @param {string} data.phone - Telefone do usuário.
   * @param {string} data.email - Endereço de e-mail do usuário.
   * @param {string} data.password - Senha desejada.
   * @param {string} data.confirmPassword - Confirmação da senha (deve ser igual).
   * @param {string} [data.endereco] - Endereço de entrega.
   * @param {string} [data.bairro] - Bairro de entrega.
   * @param {string} [data.cidade] - Cidade de entrega.
   * @param {string} [data.cep] - CEP de entrega.
   * @param {string} [data.complemento] - Complemento do endereço.
   * @returns {Promise<Object>} O registro do usuário criado.
   * @throws {AppError} 400 - Se as senhas não coincidem ou e-mail já está cadastrado.
   */
  async execute({ firstname, surname, cpf, phone, email, password, confirmPassword, endereco, bairro, cidade, cep, complemento }) {
    if (password !== confirmPassword) {
      throw new AppError("As senhas não coincidem.", 400);
    }

    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
      throw new AppError("Este usuário já está cadastrado.", 400);
    }

    const addressData = endereco ? { endereco, bairro, cidade, cep, complemento } : null;
    const user = await userRepository.create({ firstname, surname, cpf, phone, email, password }, addressData);
    return user;
  }
}

module.exports = new CreateUserService();
