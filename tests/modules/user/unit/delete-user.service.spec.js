// Testes unitários para delete-user.service.js

const deleteUserService = require("../../../../src/modules/user/core/services/delete-user.service");
const userRepository = require("../../../../src/modules/user/persistence/user.repository");

// Mock do repository
jest.mock("../../../../src/modules/user/persistence/user.repository");

describe("DeleteUserService - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const adminUser = {
    sub: "admin-user-id",
    role: "ADMIN",
  };

  const regularUser = {
    sub: "123e4567-e89b-12d3-a456-426614174000",
    role: "USER",
  };

  describe("execute", () => {
    it("deve deletar usuário quando ADMIN deleta outro usuário", async () => {
      const targetUserId = "target-user-id";
      userRepository.softDelete.mockResolvedValue(true);

      const result = await deleteUserService.execute({
        targetUserId,
        loggedUser: adminUser,
      });

      expect(userRepository.softDelete).toHaveBeenCalledWith(targetUserId);
      expect(result).toEqual({ message: "Usuário deletado com sucesso." });
    });

    it("deve lançar erro quando ADMIN tenta deletar a si mesmo", async () => {
      await expect(
        deleteUserService.execute({
          targetUserId: adminUser.sub,
          loggedUser: adminUser,
        }),
      ).rejects.toThrow("Acesso negado ou recurso não disponível.");

      expect(userRepository.softDelete).not.toHaveBeenCalled();
    });

    it("deve deletar quando USER deleta a própria conta", async () => {
      userRepository.softDelete.mockResolvedValue(true);

      const result = await deleteUserService.execute({
        targetUserId: regularUser.sub,
        loggedUser: regularUser,
      });

      expect(userRepository.softDelete).toHaveBeenCalledWith(regularUser.sub);
      expect(result).toEqual({ message: "Usuário deletado com sucesso." });
    });

    it("deve lançar erro quando USER tenta deletar outro usuário", async () => {
      const otherUserId = "other-user-id";

      await expect(
        deleteUserService.execute({
          targetUserId: otherUserId,
          loggedUser: regularUser,
        }),
      ).rejects.toThrow("Acesso negado ou recurso não disponível.");

      expect(userRepository.softDelete).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando ADMIN deleta usuário inexistente", async () => {
      const targetUserId = "non-existent-id";
      userRepository.softDelete.mockResolvedValue(false);

      await expect(
        deleteUserService.execute({
          targetUserId,
          loggedUser: adminUser,
        }),
      ).rejects.toThrow("Acesso negado ou recurso não disponível.");
    });

    it("deve lançar erro quando USER deleta própria conta mas não existe", async () => {
      userRepository.softDelete.mockResolvedValue(false);

      await expect(
        deleteUserService.execute({
          targetUserId: regularUser.sub,
          loggedUser: regularUser,
        }),
      ).rejects.toThrow("Acesso negado ou recurso não disponível.");
    });
  });
});
