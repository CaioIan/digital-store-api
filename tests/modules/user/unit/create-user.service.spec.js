// Testes unitários para create-user.service.js

const createUserService = require("../../../../src/modules/user/core/services/create-user.service");
const userRepository = require("../../../../src/modules/user/persistence/user.repository");

// Mock do repository
jest.mock("../../../../src/modules/user/persistence/user.repository");

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

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      const result = await createUserService.execute(validUserData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(validUserData.email);
      expect(userRepository.create).toHaveBeenCalledWith({
        firstname: validUserData.firstname,
        surname: validUserData.surname,
        cpf: validUserData.cpf,
        phone: validUserData.phone,
        email: validUserData.email,
        password: validUserData.password,
      }, null);
      expect(result).toHaveProperty("email");
      expect(result.email).toBe(validUserData.email);
    });
    it("deve criar um usuário com sucesso quando os dados são válidos", async () => {
      const mockUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        firstname: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        role: "USER",
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      const result = await createUserService.execute(validUserData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(validUserData.email);
      expect(userRepository.create).toHaveBeenCalledWith({
        firstname: validUserData.firstname,
        surname: validUserData.surname,
        cpf: validUserData.cpf,
        phone: validUserData.phone,
        email: validUserData.email,
        password: validUserData.password,
      }, null);
      expect(result).toHaveProperty("email");
      expect(result.email).toBe(validUserData.email);
    });

    it("deve lançar erro quando as senhas não coincidem", async () => {
      const invalidData = {
        ...validUserData,
        confirmPassword: "differentPassword",
      };

      await expect(createUserService.execute(invalidData)).rejects.toThrow("As senhas não coincidem.");

      expect(userRepository.findByEmail).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando o email já está cadastrado", async () => {
      const existingUser = {
        id: "existing-user-id",
        email: validUserData.email,
      };

      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(createUserService.execute(validUserData)).rejects.toThrow("Este usuário já está cadastrado.");

      expect(userRepository.findByEmail).toHaveBeenCalledWith(validUserData.email);
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });
});
