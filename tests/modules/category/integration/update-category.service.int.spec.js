const request = require("supertest");
const express = require("express");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const { Category, sequelize } = require("../../../../src/models");
const categoryRoutes = require("../../../../src/modules/category/routes/category.routes");

const app = express();
app.use(express.json());
app.use(categoryRoutes);

describe("Update Category - Integration Tests", () => {
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

  afterEach(async () => {
    await Category.destroy({ where: {}, truncate: true });
  });

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

  const validUpdateData = {
    name: "Eletrônicos",
    slug: "eletronicos",
    use_in_menu: false,
  };

  // Helper para criar categoria no banco antes do teste
  const createCategory = async () => {
    return await Category.create(validCategory);
  };

  it("PATCH /v1/category/:id - Deve atualizar categoria com sucesso (ADMIN)", async () => {
    const category = await createCategory();
    const token = generateToken(adminPayload);

    const response = await request(app)
      .patch(`/v1/category/${category.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(validUpdateData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", category.id);
    expect(response.body.name).toBe(validUpdateData.name);
    expect(response.body.slug).toBe(validUpdateData.slug);
    expect(response.body.use_in_menu).toBe(validUpdateData.use_in_menu);

    // Verificação no banco de dados
    const categoryInDb = await Category.findByPk(category.id);
    expect(categoryInDb.name).toBe(validUpdateData.name);
    expect(categoryInDb.slug).toBe(validUpdateData.slug);
  });

  it("PATCH /v1/category/:id - Deve retornar 403 se o usuário não for ADMIN", async () => {
    const category = await createCategory();
    const token = generateToken(userPayload);

    const response = await request(app)
      .patch(`/v1/category/${category.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(validUpdateData);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");

    // Garante que não alterou no banco
    const categoryInDb = await Category.findByPk(category.id);
    expect(categoryInDb.name).toBe(validCategory.name);
  });

  it("PATCH /v1/category/:id - Deve retornar 401 se não enviar token", async () => {
    const category = await createCategory();

    const response = await request(app)
      .patch(`/v1/category/${category.id}`)
      .send(validUpdateData);

    expect(response.status).toBe(401);
  });

  it("PATCH /v1/category/:id - Deve retornar 400 com erro de validação (campos ausentes)", async () => {
    const category = await createCategory();
    const token = generateToken(adminPayload);

    const response = await request(app)
      .patch(`/v1/category/${category.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({}); // Body vazio

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors.length).toBeGreaterThanOrEqual(3);
  });

  it("PATCH /v1/category/:id - Deve retornar 400 com erro de validação (name/slug curtos)", async () => {
    const category = await createCategory();
    const token = generateToken(adminPayload);

    const response = await request(app)
      .patch(`/v1/category/${category.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "A", slug: "B", use_in_menu: true }); // name e slug com menos de 2 chars

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("PATCH /v1/category/:id - Deve retornar 400 com erro de validação (campos extras)", async () => {
    const category = await createCategory();
    const token = generateToken(adminPayload);

    const response = await request(app)
      .patch(`/v1/category/${category.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validUpdateData, extra_field: "hack" }); // Campo extra rejeitado pelo .strict()

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("PATCH /v1/category/:id - Deve retornar 400 quando categoria não existe", async () => {
    const token = generateToken(adminPayload);
    const fakeId = "00000000-0000-0000-0000-000000000000";

    const response = await request(app)
      .patch(`/v1/category/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(validUpdateData);

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/not found/i);
  });
});
