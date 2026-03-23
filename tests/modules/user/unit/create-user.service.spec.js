// Testes unitários para create-user.service.js

const createUserService = require("../../../../src/modules/user/core/services/create-user.service");
const userRepository = require("../../../../src/modules/user/persistence/user.repository");
const EmailProvider = require("../../../../src/shared/providers/email/email.provider");

jest.mock("../../../../src/modules/user/persistence/user.repository");
jest.mock("../../../../src/shared/auth/jwt", () => ({
  generateToken: jest.fn(() => "mocked-verification-token"),
}));
jest.mock("../../../../src/shared/providers/email/email.provider", () => ({
  sendVerificationEmail: jest.fn(),
}));

describe("CreateUserService - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validUserData = {
    firstname: "John",
    surname: "Doe",
    cpf: "12345678901",
    phone: "11999990001",
    email: "john.doe@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  describe("execute", () => {
    it("deve criar um usuário com sucesso quando os dados são válidos", async () => {
      const mockUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        firstname: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        role: "USER",
      };

      userRepository.findConflictingUsers.mockResolvedValue([]);
      userRepository.create.mockResolvedValue(mockUser);
      EmailProvider.sendVerificationEmail.mockResolvedValue(true);

      const result = await createUserService.execute(validUserData);

      expect(userRepository.findConflictingUsers).toHaveBeenCalledWith(
        validUserData.email,
        validUserData.cpf,
        validUserData.phone,
      );
      expect(userRepository.create).toHaveBeenCalledWith(
        {
          firstname: validUserData.firstname,
          surname: validUserData.surname,
          cpf: validUserData.cpf,
          phone: validUserData.phone,
          email: validUserData.email,
          password: validUserData.password,
        },
        null,
      );
      expect(EmailProvider.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty("email");
      expect(result.email).toBe(validUserData.email);
    });

    it("deve lançar erro quando as senhas não coincidem", async () => {
      const invalidData = {
        ...validUserData,
        confirmPassword: "differentPassword",
      };

      await expect(createUserService.execute(invalidData)).rejects.toThrow("As senhas não coincidem.");

      expect(userRepository.findConflictingUsers).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(EmailProvider.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando o email já está cadastrado por conta verificada", async () => {
      userRepository.findConflictingUsers.mockResolvedValue([
        {
          id: "existing-user-id",
          email: validUserData.email,
          cpf: "99999999999",
          phone: "11988887777",
          is_verified: true,
        },
      ]);

      await expect(createUserService.execute(validUserData)).rejects.toThrow("Este usuário (e-mail) já está cadastrado.");

      expect(userRepository.create).not.toHaveBeenCalled();
      expect(EmailProvider.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });
});
