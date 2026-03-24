// Testes unitários para login.service.js

const loginService = require("../../../../src/modules/user/core/services/login.service");
const userRepository = require("../../../../src/modules/user/persistence/user.repository");
const bcrypt = require("bcrypt");

// Mocks
jest.mock("../../../../src/modules/user/persistence/user.repository");
jest.mock("bcrypt");
jest.mock("../../../../src/shared/auth/jwt", () => ({
  generateToken: jest.fn(() => "mocked-jwt-token"),
}));

describe("LoginService - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validCredentials = {
    email: "john.doe@example.com",
    password: "password123",
  };

  const mockUser = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    firstname: "John",
    surname: "Doe",
    email: "john.doe@example.com",
    password: "$2b$10$hashedpassword",
    role: "USER",
  };

  describe("execute", () => {
    it("deve realizar login com sucesso quando credenciais são válidas", async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await loginService.execute(validCredentials);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(validCredentials.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(validCredentials.password, mockUser.password);
      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("user");
      expect(result.user.email).toBe(validCredentials.email);
    });

    it("deve lançar erro quando o usuário não existe", async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(loginService.execute(validCredentials)).rejects.toThrow("Credenciais inválidas");

      expect(userRepository.findByEmail).toHaveBeenCalledWith(validCredentials.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando a senha está incorreta", async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(loginService.execute(validCredentials)).rejects.toThrow("Credenciais inválidas");

      expect(userRepository.findByEmail).toHaveBeenCalledWith(validCredentials.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(validCredentials.password, mockUser.password);
    });
  });
});
