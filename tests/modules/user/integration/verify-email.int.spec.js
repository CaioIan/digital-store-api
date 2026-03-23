const request = require("supertest");
const app = require("../../../../src/app");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const {
  setupTestDatabase,
  clearTestDatabase,
  closeTestDatabase,
  createTestUser,
  User,
} = require("../../../helpers/test-database.helper");

describe("User Route - GET /v1/user/verify-email", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("deve verificar email com token válido", async () => {
    const user = await createTestUser({ is_verified: false, email: "verify-success@test.com" });
    const token = generateToken({ sub: user.id }, { expiresIn: "1h" });

    const response = await request(app).get(`/v1/user/verify-email?token=${token}`);

    expect(response.status).toBe(200);
    expect(response.text).toMatch(/verificado com sucesso/i);

    const updatedUser = await User.findByPk(user.id);
    expect(updatedUser.is_verified).toBe(true);
  });

  it("deve retornar 400 para token inválido", async () => {
    const response = await request(app).get("/v1/user/verify-email?token=token-invalido");

    expect(response.status).toBe(400);
    expect(response.text).toMatch(/inválido|expirado|não foi possível/i);
  });

  it("deve retornar 400 quando email já foi verificado", async () => {
    const user = await createTestUser({ is_verified: true, email: "already-verified@test.com" });
    const token = generateToken({ sub: user.id }, { expiresIn: "1h" });

    const response = await request(app).get(`/v1/user/verify-email?token=${token}`);

    expect(response.status).toBe(400);
    expect(response.text).toMatch(/já foi verificado/i);
  });
});
