const request = require("supertest");
const app = require("../../../../src/app");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const {
  setupTestDatabase,
  clearTestDatabase,
  closeTestDatabase,
  createTestUser,
  UserAddress,
} = require("../../../helpers/test-database.helper");

describe("User Route - GET /v1/user/profile", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("deve retornar perfil completo com endereço", async () => {
    const user = await createTestUser({ email: "profile@test.com" });
    await UserAddress.create({
      user_id: user.id,
      endereco: "Rua A, 100",
      bairro: "Centro",
      cidade: "Fortaleza",
      estado: "CE",
      cep: "60000-000",
      complemento: "Apto 101",
    });

    const token = generateToken({ sub: user.id, role: user.role });
    const response = await request(app)
      .get("/v1/user/profile")
      .set("Cookie", [`access_token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: user.id,
      email: "profile@test.com",
      address: "Rua A, 100",
      neighborhood: "Centro",
      city: "Fortaleza",
      state: "CE",
      cep: "60000-000",
      complement: "Apto 101",
    });
  });

  it("deve retornar 401 sem cookie de autenticação", async () => {
    const response = await request(app).get("/v1/user/profile");
    expect(response.status).toBe(401);
  });
});
