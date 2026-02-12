// Testes unitários para get-user-by-id.service.js

const getUserByIdService = require("../../../../src/modules/user/core/services/get-user-by-id.service");
const userRepository = require("../../../../src/modules/user/persistence/user.repository");

// Mock do repository
jest.mock("../../../../src/modules/user/persistence/user.repository");

describe("GetUserByIdService - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    firstname: "John",
    surname: "Doe",
    email: "john.doe@example.com",
    role: "USER",
  };

  const adminUser = {
    sub: "admin-user-id",
    role: "ADMIN",
  };

  const regularUser = {
    sub: "123e4567-e89b-12d3-a456-426614174000",
    role: "USER",
  };

  describe("execute", () => {
    it("deve retornar usuário quando ADMIN busca qualquer usuário", async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await getUserByIdService.execute({
        targetUserId: mockUser.id,
        loggedUser: adminUser,
      });

      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveProperty("id");
      expect(result.id).toBe(mockUser.id);
    });

    it("deve retornar usuário quando USER busca o próprio ID", async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await getUserByIdService.execute({
        targetUserId: mockUser.id,
        loggedUser: regularUser,
      });

      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveProperty("id");
      expect(result.id).toBe(mockUser.id);
    });

    it("deve lançar erro quando USER tenta buscar outro usuário", async () => {
      const otherUserId = "other-user-id";

      await expect(
        getUserByIdService.execute({
          targetUserId: otherUserId,
          loggedUser: regularUser,
        }),
      ).rejects.toThrow("Acesso negado ou recurso não disponível.");

      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando ADMIN busca usuário inexistente", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        getUserByIdService.execute({
          targetUserId: "non-existent-id",
          loggedUser: adminUser,
        }),
      ).rejects.toThrow("Acesso negado ou recurso não disponível.");
    });

    it("deve lançar erro quando USER busca próprio ID mas usuário não existe", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        getUserByIdService.execute({
          targetUserId: regularUser.sub,
          loggedUser: regularUser,
        }),
      ).rejects.toThrow("Acesso negado ou recurso não disponível.");
    });
  });
});
