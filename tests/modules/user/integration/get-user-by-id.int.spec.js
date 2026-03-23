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

describe("User Route - GET /v1/user/:id", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("ADMIN deve conseguir buscar qualquer usuário", async () => {
    const admin = await createTestAdmin({ email: "admin-get-id@test.com" });
    const targetUser = await createTestUser({ email: "target-get-id@test.com" });
    const token = generateToken({ sub: admin.id, role: admin.role });

    const response = await request(app)
      .get(`/v1/user/${targetUser.id}`)
      .set("Cookie", [`access_token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", targetUser.id);
    expect(response.body).toHaveProperty("email", targetUser.email);
  });

  it("USER deve conseguir buscar apenas o próprio usuário", async () => {
    const user = await createTestUser({ email: "self-get-id@test.com" });
    const token = generateToken({ sub: user.id, role: user.role });

    const response = await request(app)
      .get(`/v1/user/${user.id}`)
      .set("Cookie", [`access_token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", user.id);
  });

  it("USER não deve conseguir buscar outro usuário (403)", async () => {
    const userA = await createTestUser({ email: "user-a-get-id@test.com" });
    const userB = await createTestUser({ email: "user-b-get-id@test.com" });
    const token = generateToken({ sub: userA.id, role: userA.role });

    const response = await request(app)
      .get(`/v1/user/${userB.id}`)
      .set("Cookie", [`access_token=${token}`]);

    expect(response.status).toBe(403);
  });

  it("deve retornar 401 sem autenticação", async () => {
    const user = await createTestUser({ email: "no-auth-get-id@test.com" });

    const response = await request(app).get(`/v1/user/${user.id}`);

    expect(response.status).toBe(401);
  });
});
