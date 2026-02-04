// Testes de integração para delete-user.service.js

const deleteUserService = require("../../../../src/modules/user/core/services/delete-user.service");
const {
  setupTestDatabase,
  clearTestDatabase,
  createTestUser,
  createTestAdmin,
  User,
} = require("../../../helpers/test-database.helper");

describe("DeleteUserService - Integration Tests", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  describe("execute", () => {
    it("deve deletar (soft delete) usuário quando ADMIN deleta outro usuário", async () => {
      const admin = await createTestAdmin();
      const user = await createTestUser({ email: "user@example.com" });

      const loggedUser = { sub: admin.id, role: "ADMIN" };

      const result = await deleteUserService.execute({
        targetUserId: user.id,
        loggedUser,
      });

      expect(result).toEqual({ message: "Usuário deletado com sucesso." });

      // Verifica que o usuário foi soft deleted
      const deletedUser = await User.findByPk(user.id, { paranoid: false });
      expect(deletedUser).not.toBeNull();
      expect(deletedUser.deleted_at).not.toBeNull();
    });

    it("deve lançar erro quando ADMIN tenta deletar a si mesmo", async () => {
      const admin = await createTestAdmin();
      const loggedUser = { sub: admin.id, role: "ADMIN" };

      await expect(
        deleteUserService.execute({
          targetUserId: admin.id,
          loggedUser,
        }),
      ).rejects.toThrow("Acesso negado ou recurso não disponível.");

      // Verifica que o admin não foi deletado
      const adminUser = await User.findByPk(admin.id);
      expect(adminUser).not.toBeNull();
      expect(adminUser.deleted_at).toBeNull();
    });

    it("deve deletar quando USER deleta a própria conta", async () => {
      const user = await createTestUser({ email: "user@example.com" });
      const loggedUser = { sub: user.id, role: "USER" };

      const result = await deleteUserService.execute({
        targetUserId: user.id,
        loggedUser,
      });

      expect(result).toEqual({ message: "Usuário deletado com sucesso." });

      // Verifica soft delete no banco
      const deletedUser = await User.findByPk(user.id, { paranoid: false });
      expect(deletedUser.deleted_at).not.toBeNull();
    });

    it("deve lançar erro quando USER tenta deletar outro usuário", async () => {
      const user1 = await createTestUser({ email: "user1@example.com" });
      const user2 = await createTestUser({ email: "user2@example.com" });

      const loggedUser = { sub: user1.id, role: "USER" };

      await expect(
        deleteUserService.execute({
          targetUserId: user2.id,
          loggedUser,
        }),
      ).rejects.toThrow("Acesso negado ou recurso não disponível.");

      // Verifica que o user2 não foi deletado
      const unchangedUser = await User.findByPk(user2.id);
      expect(unchangedUser).not.toBeNull();
      expect(unchangedUser.deleted_at).toBeNull();
    });

    it("deve lançar erro quando tenta deletar usuário inexistente", async () => {
      const admin = await createTestAdmin();
      const loggedUser = { sub: admin.id, role: "ADMIN" };

      await expect(
        deleteUserService.execute({
          targetUserId: "00000000-0000-0000-0000-000000000000",
          loggedUser,
        }),
      ).rejects.toThrow("Acesso negado ou recurso não disponível.");
    });

    it("deve lançar erro quando tenta deletar usuário já deletado", async () => {
      const admin = await createTestAdmin();
      const user = await createTestUser({ email: "user@example.com" });

      // Soft delete o usuário primeiro
      await User.update({ deleted_at: new Date() }, { where: { id: user.id } });

      const loggedUser = { sub: admin.id, role: "ADMIN" };

      await expect(
        deleteUserService.execute({
          targetUserId: user.id,
          loggedUser,
        }),
      ).rejects.toThrow("Acesso negado ou recurso não disponível.");
    });
  });
});
