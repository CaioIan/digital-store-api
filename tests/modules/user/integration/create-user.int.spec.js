const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const routes = require("../../../../src/modules/user/routes/user.routes");
const { setupTestDatabase, clearTestDatabase, sequelize } = require("../../../helpers/test-database.helper");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(routes);

const errorHandler = require("../../../../src/shared/middlewares/error-handler.middleware");
app.use(errorHandler);

describe("User Route - POST /v1/user", () => {
  const longString50 = "a".repeat(51);
  const longString100 = "a".repeat(101);

  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("deve retornar 400 se firstname, surname ou password excederem limites", async () => {
    const invalidData = {
      firstname: longString50,
      surname: longString50,
      email: "valid@email.com",
      password: longString100,
      confirmPassword: longString100,
    };

    const response = await request(app).post("/v1/user").send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");

    const errors = response.body.errors;
    expect(errors.some((e) => e.message.includes("50 caracteres"))).toBe(true);
    expect(errors.some((e) => e.message.includes("100 caracteres"))).toBe(true);
  });

  it("deve retornar 400 se o email for de provedor temporario", async () => {
    const invalidData = {
      firstname: "John",
      surname: "Doe",
      cpf: "12345678901",
      phone: "11999999999",
      email: "user@mailinator.com",
      password: "password123",
      confirmPassword: "password123",
    };

    const response = await request(app).post("/v1/user").send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");

    const errors = response.body.errors;
    expect(errors.some((e) => /provedores de email tempor[aá]rios.*permitidos/i.test(e.message))).toBe(true);
  });
});
