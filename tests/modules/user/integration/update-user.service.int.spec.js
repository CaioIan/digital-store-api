// Testes de integração para update-user.service.js

const updateUserService = require("../../../../src/modules/user/core/services/update-user.service");
const {
  setupTestDatabase,
  clearTestDatabase,
  createTestUser,
  createTestAdmin,
  User,
} = require("../../../helpers/test-database.helper");

describe("UpdateUserService - Integration Tests", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  describe("execute", () => {
    it("deve atualizar usuário quando ADMIN atualiza qualquer usuário", async () => {
      const admin = await createTestAdmin();
      const user = await createTestUser({ email: "user@example.com" });

      const updateData = { firstname: "Updated", surname: "Name" };
      const loggedUser = { sub: admin.id, role: "ADMIN" };


      const result = await updateUserService.execute(user.id, loggedUser, updateData);
      expect(result.firstname).toBe("Updated");
      expect(result.surname).toBe("Name");

      // Verifica no banco
      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.firstname).toBe("Updated");
      expect(updatedUser.surname).toBe("Name");
    });

    it("deve atualizar usuário quando USER atualiza próprio perfil", async () => {
      const user = await createTestUser({ email: "user@example.com" });

      const updateData = { firstname: "NewFirstname", surname: "NewSurname" };
      const loggedUser = { sub: user.id, role: "USER" };


      const result = await updateUserService.execute(user.id, loggedUser, updateData);
      expect(result.firstname).toBe("NewFirstname");
      expect(result.surname).toBe("NewSurname");

      // Verifica no banco
      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.firstname).toBe("NewFirstname");
    });

    it("deve lançar erro quando USER tenta atualizar outro usuário", async () => {
      const user1 = await createTestUser({ email: "user1@example.com" });
      const user2 = await createTestUser({ email: "user2@example.com" });

      const updateData = { firstname: "Hacked" };
      const loggedUser = { sub: user1.id, role: "USER" };

      await expect(updateUserService.execute(user2.id, loggedUser, updateData)).rejects.toThrow(
        "Acesso negado ou recurso não disponível.",
      );

      // Verifica que o user2 não foi modificado
      const unchangedUser = await User.findByPk(user2.id);
      expect(unchangedUser.firstname).toBe("Test");
    });

    it("deve atualizar apenas firstname e surname, ignorando outros campos", async () => {
      const user = await createTestUser({ email: "user@example.com" });

      const updateData = {
        firstname: "NewFirstname",
        surname: "NewSurname",
        email: "hacked@example.com",
        role: "ADMIN",
      };
      const loggedUser = { sub: user.id, role: "USER" };

      await updateUserService.execute(user.id, loggedUser, updateData);

      // Verifica no banco que email e role não foram alterados
      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.firstname).toBe("NewFirstname");
      expect(updatedUser.email).toBe("user@example.com");
      expect(updatedUser.role).toBe("USER");
    });

    it("deve lançar erro quando tenta atualizar usuário inexistente", async () => {
      const admin = await createTestAdmin();
      const loggedUser = { sub: admin.id, role: "ADMIN" };

      await expect(
        updateUserService.execute("00000000-0000-0000-0000-000000000000", loggedUser, { firstname: "Test" }),
      ).rejects.toThrow("Acesso negado ou recurso não disponível.");
    });
  });
});
