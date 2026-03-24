const adminLoginService = require("../../../../src/modules/user/core/services/admin-login.service");
const userRepository = require("../../../../src/modules/user/persistence/user.repository");
const bcrypt = require("bcrypt");

jest.mock("../../../../src/modules/user/persistence/user.repository");
jest.mock("bcrypt");
jest.mock("../../../../src/shared/auth/jwt", () => ({
  generateToken: jest.fn(() => "mocked-admin-jwt-token"),
}));

describe("AdminLoginService - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validCredentials = {
    email: "admin@example.com",
    password: "password123",
  };

  const mockAdmin = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    firstname: "Admin",
    surname: "User",
    email: "admin@example.com",
    password: "$2b$10$hashedpassword",
    role: "ADMIN",
  };

  it("deve realizar login com sucesso quando credenciais são válidas e role é ADMIN", async () => {
    userRepository.findByEmail.mockResolvedValue(mockAdmin);
    bcrypt.compare.mockResolvedValue(true);

    const result = await adminLoginService.execute(validCredentials);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(validCredentials.email);
    expect(bcrypt.compare).toHaveBeenCalledWith(validCredentials.password, mockAdmin.password);
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("user");
    expect(result.user.email).toBe(validCredentials.email);
  });

  it("deve retornar 403 quando usuário autenticado não for ADMIN", async () => {
    userRepository.findByEmail.mockResolvedValue({ ...mockAdmin, role: "USER" });
    bcrypt.compare.mockResolvedValue(true);

    await expect(adminLoginService.execute(validCredentials)).rejects.toThrow(
      "Acesso negado: apenas administradores podem acessar esta área",
    );
  });
});
