// Testes de integração para create-user.service.js

jest.mock("../../../../src/shared/providers/email/email.provider", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
}));

const createUserService = require("../../../../src/modules/user/core/services/create-user.service");
const { setupTestDatabase, clearTestDatabase, User } = require("../../../helpers/test-database.helper");

describe("CreateUserService - Integration Tests", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
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
    it("deve criar um usuário no banco de dados com sucesso", async () => {
      const result = await createUserService.execute(validUserData);

      expect(result).toHaveProperty("email");
      expect(result.email).toBe(validUserData.email);
      expect(result.firstname).toBe(validUserData.firstname);
      expect(result.surname).toBe(validUserData.surname);

      // Verifica se o usuário foi realmente criado no banco
      const userInDb = await User.findOne({ where: { email: validUserData.email } });
      expect(userInDb).not.toBeNull();
      expect(userInDb.email).toBe(validUserData.email);
      expect(userInDb.role).toBe("USER");
    });
    it("deve criar um usuário no banco de dados com sucesso", async () => {
      const result = await createUserService.execute(validUserData);

      expect(result).toHaveProperty("email");
      expect(result.email).toBe(validUserData.email);
      expect(result.firstname).toBe(validUserData.firstname);
      expect(result.surname).toBe(validUserData.surname);

      // Verifica se o usuário foi realmente criado no banco
      const userInDb = await User.findOne({ where: { email: validUserData.email } });
      expect(userInDb).not.toBeNull();
      expect(userInDb.email).toBe(validUserData.email);
      expect(userInDb.role).toBe("USER");
    });

    it("deve hashear a senha ao criar o usuário", async () => {
      await createUserService.execute(validUserData);

      const userInDb = await User.findOne({ where: { email: validUserData.email } });
      expect(userInDb.password).not.toBe(validUserData.password);
      expect(userInDb.password).toMatch(/^\$2[ab]\$/); // bcrypt hash pattern
    });

    it("deve lançar erro quando as senhas não coincidem", async () => {
      const invalidData = {
        ...validUserData,
        confirmPassword: "differentPassword",
      };

      await expect(createUserService.execute(invalidData)).rejects.toThrow("As senhas não coincidem.");

      // Verifica que nenhum usuário foi criado
      const userInDb = await User.findOne({ where: { email: validUserData.email } });
      expect(userInDb).toBeNull();
    });

    it("deve lançar erro quando o email já está cadastrado", async () => {
      // Cria o primeiro usuário
      await createUserService.execute(validUserData);
      await User.update({ is_verified: true }, { where: { email: validUserData.email } });

      // Tenta criar outro usuário com o mesmo email
      const duplicateUser = {
        ...validUserData,
        firstname: "Jane",
      };

      await expect(createUserService.execute(duplicateUser)).rejects.toThrow("Este usuário (e-mail) já está cadastrado.");

      // Verifica que só existe um usuário com esse email
      const usersCount = await User.count({ where: { email: validUserData.email } });
      expect(usersCount).toBe(1);
    });

    it("deve sempre definir role como USER independente do input", async () => {
      const result = await createUserService.execute(validUserData);

      const userInDb = await User.findOne({ where: { email: validUserData.email } });
      expect(userInDb.role).toBe("USER");
    });
  });
});
