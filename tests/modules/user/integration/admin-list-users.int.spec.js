const request = require("supertest");
const app = require("../../../../src/app");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const {
  setupTestDatabase,
  clearTestDatabase,
  closeTestDatabase,
  createTestUser,
  createTestAdmin,
} = require("../../../helpers/test-database.helper");

describe("User Route - GET /v1/admin/users", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("ADMIN deve listar usuários com paginação", async () => {
    const admin = await createTestAdmin({ email: "admin-list-users@test.com" });
    await createTestUser({ email: "list-user-1@test.com" });
    await createTestUser({ email: "list-user-2@test.com" });
    const token = generateToken({ sub: admin.id, role: admin.role });

    const response = await request(app)
      .get("/v1/admin/users?limit=2&page=1")
      .set("Cookie", [`access_token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("total");
    expect(response.body).toHaveProperty("limit", 2);
    expect(response.body).toHaveProperty("page", 1);
    expect(response.body.data.length).toBeLessThanOrEqual(2);
    expect(response.body.data[0]).not.toHaveProperty("password");
  });

  it("USER deve receber 403 ao tentar listar usuários", async () => {
    const user = await createTestUser({ email: "normal-user-list@test.com" });
    const token = generateToken({ sub: user.id, role: user.role });

    const response = await request(app)
      .get("/v1/admin/users")
      .set("Cookie", [`access_token=${token}`]);

    expect(response.status).toBe(403);
  });

  it("deve retornar 401 sem autenticação", async () => {
    const response = await request(app).get("/v1/admin/users");
    expect(response.status).toBe(401);
  });
});
