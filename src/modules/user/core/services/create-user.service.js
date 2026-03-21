const AppError = require("../../../../shared/errors/app-error");
const userRepository = require("../../persistence/user.repository");
const { generateToken } = require("../../../../shared/auth/jwt");
const EmailProvider = require("../../../../shared/providers/email/email.provider");

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
  async execute({ firstname, surname, cpf, phone, email, password, confirmPassword, endereco, bairro, cidade, estado, cep, complemento }) {
    if (password !== confirmPassword) {
      throw new AppError("As senhas não coincidem.", 400);
    }

    const conflictingUsers = await userRepository.findConflictingUsers(email, cpf, phone);
    for (const conflict of conflictingUsers) {
      if (!conflict.is_verified) {
        // Qualquer conta fantasma segurando o email, cpf ou telefone é deletada fisicamente (hard delete) em cascata.
        await userRepository.hardDelete(conflict.id);
      } else {
        if (conflict.email === email) throw new AppError("Este usuário (e-mail) já está cadastrado.", 400);
        if (conflict.cpf === cpf) throw new AppError("Este CPF já está cadastrado.", 400);
        if (conflict.phone === phone) throw new AppError("Este telefone já está cadastrado.", 400);
      }
    }

    const addressData = endereco ? { endereco, bairro, cidade, estado, cep, complemento } : null;
    const user = await userRepository.create({ firstname, surname, cpf, phone, email, password }, addressData);

    const verificationToken = generateToken({ sub: user.id }, { expiresIn: "1h" });

    try {
      await EmailProvider.sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      await userRepository.hardDelete(user.id);
      throw new AppError("Não foi possível enviar o email de verificação. Tente novamente.", 500);
    }

    return user;
  }
}

module.exports = new CreateUserService();
