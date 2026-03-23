const request = require("supertest");
const app = require("../../../../src/app");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const {
  setupTestDatabase,
  clearTestDatabase,
  closeTestDatabase,
  createTestUser,
} = require("../../../helpers/test-database.helper");

describe("User Route - PUT /v1/user/address", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("deve criar/atualizar endereço com sucesso", async () => {
    const user = await createTestUser({ email: "address-success@test.com" });
    const token = generateToken({ sub: user.id, role: user.role });

    const payload = {
      address: "Rua B, 200",
      neighborhood: "Aldeota",
      city: "Fortaleza",
      state: "CE",
      cep: "60100-000",
      complement: "Casa",
    };

    const response = await request(app)
      .put("/v1/user/address")
      .set("Cookie", [`access_token=${token}`])
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Endereço atualizado com sucesso");
    expect(response.body.user).toMatchObject({
      id: user.id,
      address: payload.address,
      neighborhood: payload.neighborhood,
      city: payload.city,
      state: payload.state,
      cep: payload.cep,
      complement: payload.complement,
    });
  });

  it("deve retornar 400 quando body é inválido", async () => {
    const user = await createTestUser({ email: "address-invalid@test.com" });
    const token = generateToken({ sub: user.id, role: user.role });

    const response = await request(app)
      .put("/v1/user/address")
      .set("Cookie", [`access_token=${token}`])
      .send({ city: "Fortaleza" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("deve retornar 401 sem autenticação", async () => {
    const response = await request(app)
      .put("/v1/user/address")
      .send({
        address: "Rua X",
        neighborhood: "Centro",
        city: "Fortaleza",
        state: "CE",
        cep: "60000-000",
      });

    expect(response.status).toBe(401);
  });
});
