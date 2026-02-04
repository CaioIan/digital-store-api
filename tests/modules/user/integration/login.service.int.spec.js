// Testes de integração para login.service.js

const loginService = require("../../../../src/modules/user/core/services/login.service");
const createUserService = require("../../../../src/modules/user/core/services/create-user.service");
const { setupTestDatabase, clearTestDatabase } = require("../../../helpers/test-database.helper");

describe("LoginService - Integration Tests", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  const validUserData = {
    firstname: "John",
    surname: "Doe",
    email: "john.doe@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  describe("execute", () => {
    it("deve realizar login com sucesso com credenciais válidas", async () => {
      // Primeiro cria o usuário
      await createUserService.execute(validUserData);

      // Realiza login
      const result = await loginService.execute({
        email: validUserData.email,
        password: validUserData.password,
      });

      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("user");
      expect(result.user.email).toBe(validUserData.email);
      expect(result.user.firstname).toBe(validUserData.firstname);
      expect(result.token).toBeTruthy();
    });

    it("deve retornar um token JWT válido", async () => {
      await createUserService.execute(validUserData);

      const result = await loginService.execute({
        email: validUserData.email,
        password: validUserData.password,
      });

      // Verifica se é um JWT válido (formato: header.payload.signature)
      const jwtParts = result.token.split(".");
      expect(jwtParts).toHaveLength(3);
    });

    it("deve lançar erro quando o email não existe", async () => {
      await expect(
        loginService.execute({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Credenciais inválidas");
    });

    it("deve lançar erro quando a senha está incorreta", async () => {
      await createUserService.execute(validUserData);

      await expect(
        loginService.execute({
          email: validUserData.email,
          password: "wrongpassword",
        }),
      ).rejects.toThrow("Credenciais inválidas");
    });

    it("não deve permitir login de usuário deletado (soft delete)", async () => {
      // Cria o usuário
      await createUserService.execute(validUserData);

      // Simula soft delete
      const { User } = require("../../../helpers/test-database.helper");
      await User.update({ deleted_at: new Date() }, { where: { email: validUserData.email } });

      // Tenta fazer login
      await expect(
        loginService.execute({
          email: validUserData.email,
          password: validUserData.password,
        }),
      ).rejects.toThrow("Credenciais inválidas");
    });
  });
});
