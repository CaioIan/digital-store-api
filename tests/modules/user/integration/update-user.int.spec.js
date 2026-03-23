const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const routes = require("../../../../src/modules/user/routes/user.routes");
const { setupTestDatabase, clearTestDatabase, sequelize, createTestUser } = require("../../../helpers/test-database.helper");
const { generateToken } = require("../../../../src/shared/auth/jwt");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(routes);

const errorHandler = require("../../../../src/shared/middlewares/error-handler.middleware");
app.use(errorHandler);

describe("User Route - PATCH /v1/user/:id", () => {
  const longString50 = "a".repeat(51);

  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("deve retornar 400 se firstname ou surname excederem 50 caracteres", async () => {
    const user = await createTestUser({ email: "update-limits@test.com" });
    const token = generateToken({ sub: user.id, role: "USER" });

    const invalidData = {
      firstname: longString50,
      surname: longString50,
    };

    const response = await request(app)
      .patch(`/v1/user/${user.id}`)
      .set("Cookie", `access_token=${token}`)
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(JSON.stringify(response.body.errors)).toMatch(/50/);
  });
});
