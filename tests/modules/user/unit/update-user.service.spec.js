// Testes unitários para update-user.service.js

const updateUserService = require("../../../../src/modules/user/core/services/update-user.service");
const userRepository = require("../../../../src/modules/user/persistence/user.repository");

// Mock do repository
jest.mock("../../../../src/modules/user/persistence/user.repository");

describe("UpdateUserService - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    firstname: "John",
    surname: "Doe",
    email: "john.doe@example.com",
    role: "USER",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const adminUser = {
    sub: "admin-user-id",
    role: "ADMIN",
  };

  const regularUser = {
    sub: "123e4567-e89b-12d3-a456-426614174000",
    role: "USER",
  };

  const updateData = {
    firstname: "Jane",
    surname: "Smith",
  };

  describe("execute", () => {
    it("deve atualizar usuário quando ADMIN atualiza qualquer usuário", async () => {
      const updatedUser = { ...mockUser, ...updateData };
      userRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await updateUserService.execute(mockUser.id, adminUser, updateData);

      expect(userRepository.updateUser).toHaveBeenCalledWith(mockUser.id, updateData);
      expect(result).toHaveProperty("user");
      expect(result.user.firstname).toBe(updateData.firstname);
    });

    it("deve atualizar usuário quando USER atualiza próprio perfil", async () => {
      const updatedUser = { ...mockUser, ...updateData };
      userRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await updateUserService.execute(mockUser.id, regularUser, updateData);

      expect(userRepository.updateUser).toHaveBeenCalledWith(mockUser.id, updateData);
      expect(result).toHaveProperty("user");
      expect(result.user.firstname).toBe(updateData.firstname);
    });

    it("deve lançar erro quando USER tenta atualizar outro usuário", async () => {
      const otherUserId = "other-user-id";

      await expect(updateUserService.execute(otherUserId, regularUser, updateData)).rejects.toThrow(
        "Acesso negado ou recurso não disponível.",
      );

      expect(userRepository.updateUser).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando ADMIN atualiza usuário inexistente", async () => {
      userRepository.updateUser.mockResolvedValue(null);

      await expect(updateUserService.execute("non-existent-id", adminUser, updateData)).rejects.toThrow(
        "Acesso negado ou recurso não disponível.",
      );
    });

    it("deve lançar erro quando USER atualiza próprio perfil mas não existe", async () => {
      userRepository.updateUser.mockResolvedValue(null);

      await expect(updateUserService.execute(regularUser.sub, regularUser, updateData)).rejects.toThrow(
        "Acesso negado ou recurso não disponível.",
      );
    });
  });
});
