const request = require("supertest");
const express = require("express");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const { Category, sequelize } = require("../../../../src/models");
const categoryRoutes = require("../../../../src/modules/category/routes/category.routes");

// Setup da aplicação Express para o teste
const app = express();
app.use(express.json());
app.use(categoryRoutes);
const errorHandler = require("../../../../src/shared/middlewares/error-handler.middleware");
app.use(errorHandler);

describe("Get Category By Id - Integration Tests", () => {
  let createdCategory;

  beforeAll(async () => {
    try {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
      await sequelize.sync({ force: true });
    } catch (error) {
      console.error("Erro ao sincronizar banco de dados de teste:", error);
      throw error;
    } finally {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
    }
  });

  beforeEach(async () => {
    // Cria uma categoria para ser usada nos testes
    createdCategory = await Category.create({
      name: "Eletrônicos",
      slug: "eletronicos",
      use_in_menu: true,
    });
  });

  afterEach(async () => {
    await Category.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // Payloads de autenticação
  const adminPayload = { sub: "admin-id", role: "ADMIN", email: "admin@test.com" };
  const userPayload = { sub: "user-id", role: "USER", email: "user@test.com" };

  it("GET /v1/category/:id - Deve retornar a categoria com sucesso (usuário autenticado)", async () => {
    const token = generateToken(userPayload);

    const response = await request(app)
      .get(`/v1/category/${createdCategory.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", createdCategory.id);
    expect(response.body).toHaveProperty("name", "Eletrônicos");
    expect(response.body).toHaveProperty("slug", "eletronicos");
    expect(response.body).toHaveProperty("use_in_menu", true);
    // Garante que createdAt e updatedAt são omitidos pelo DTO
    expect(response.body).not.toHaveProperty("createdAt");
    expect(response.body).not.toHaveProperty("updatedAt");
    expect(response.body).not.toHaveProperty("created_at");
    expect(response.body).not.toHaveProperty("updated_at");
  });

  it("GET /v1/category/:id - Deve retornar a categoria com sucesso (ADMIN)", async () => {
    const token = generateToken(adminPayload);

    const response = await request(app)
      .get(`/v1/category/${createdCategory.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdCategory.id);
    expect(response.body.name).toBe("Eletrônicos");
  });

  it("GET /v1/category/:id - Deve retornar 404 quando a categoria não existe", async () => {
    const token = generateToken(userPayload);
    const nonExistentId = "00000000-0000-4000-a000-000000000000";

    const response = await request(app).get(`/v1/category/${nonExistentId}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Recurso não encontrado.");
  });

  it("GET /v1/category/:id - Deve retornar 400 quando o ID não é um UUID válido", async () => {
    const token = generateToken(userPayload);

    const response = await request(app).get("/v1/category/invalid-id").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors[0]).toHaveProperty("field", "id");
    expect(response.body.errors[0].message).toMatch(/UUID/i);
  });

  it("GET /v1/category/:id - Deve retornar 401 se não enviar token", async () => {
    const response = await request(app).get(`/v1/category/${createdCategory.id}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
  });

  it("GET /v1/category/:id - Deve retornar 401 se enviar token inválido", async () => {
    const response = await request(app)
      .get(`/v1/category/${createdCategory.id}`)
      .set("Authorization", "Bearer token-invalido-123");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
  });
});
