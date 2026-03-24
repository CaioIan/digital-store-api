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

describe("Create Category - Integration Tests", () => {
  // Garante que a tabela existe antes dos testes e limpa após cada teste
  beforeAll(async () => {
    try {
      // Desabilita verificação de FK para evitar erros ao dropar tabelas com relacionamentos
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
      await sequelize.sync({ force: true });
    } catch (error) {
      console.error("Erro ao sincronizar banco de dados de teste:", error);
      throw error;
    } finally {
      // Reabilita verificação de FK
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
    }
  });

  afterEach(async () => {
    // Limpa a tabela após cada teste mantendo a estrutura
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
    await Category.destroy({ where: {}, truncate: true, force: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
  });

  // Fecha a conexão após todos os testes para liberar o processo
  afterAll(async () => {
    await sequelize.close();
  });

  // Dados de teste
  const adminPayload = { sub: "admin-id", role: "ADMIN", email: "admin@test.com" };
  const userPayload = { sub: "user-id", role: "USER", email: "user@test.com" };

  const validCategory = {
    name: "Games",
    slug: "games",
    use_in_menu: true,
  };

  it("POST /v1/category - Deve criar uma categoria com sucesso (ADMIN)", async () => {
    const token = generateToken(adminPayload);

    const response = await request(app)
      .post("/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send(validCategory);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(validCategory.name);
    expect(response.body.slug).toBe(validCategory.slug);

    // Verificação no banco de dados (persistência real)
    const categoryInDb = await Category.findOne({ where: { slug: validCategory.slug } });
    expect(categoryInDb).not.toBeNull();
    expect(categoryInDb.name).toBe(validCategory.name);
  });

  it("POST /v1/category - Deve retornar 403 se o usuário não for ADMIN", async () => {
    const token = generateToken(userPayload);

    const response = await request(app)
      .post("/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send(validCategory);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");
    // Garante que não salvou no banco
    const count = await Category.count();
    expect(count).toBe(0);
  });

  it("POST /v1/category - Deve retornar 401 se não enviar token", async () => {
    const response = await request(app).post("/v1/category").send(validCategory);

    expect(response.status).toBe(401);
  });

  it("POST /v1/category - Deve retornar 400 se houver erro de validação (Schema)", async () => {
    const token = generateToken(adminPayload);
    const invalidData = {
      name: "", // Nome vazio inválido
      // slug faltando
    };

    const response = await request(app).post("/v1/category").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("POST /v1/category - Deve retornar 400 se a categoria já existir (Duplicidade)", async () => {
    const token = generateToken(adminPayload);

    // Cria a primeira vez
    await Category.create(validCategory);

    // Tenta criar novamente com os mesmos dados
    const response = await request(app)
      .post("/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send(validCategory);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/já existe/i);
  });

  it("POST /v1/category - Deve retornar 400 se o nome ou slug excederem o limite de caracteres", async () => {
    const token = generateToken(adminPayload);
    const longString = "a".repeat(51);

    const invalidData = {
      name: longString,
      slug: longString,
      use_in_menu: true,
    };

    const response = await request(app).post("/v1/category").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");

    // Verifica se os erros de validação contêm mensagens sobre o limite
    const errors = response.body.errors;
    expect(errors.some((e) => e.message.includes("50 caracteres"))).toBe(true);
  });
});
