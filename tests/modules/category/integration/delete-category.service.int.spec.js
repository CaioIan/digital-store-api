const request = require("supertest");
const express = require("express");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const { Category, sequelize } = require("../../../../src/models");
const categoryRoutes = require("../../../../src/modules/category/routes/category.routes");

const app = express();
app.use(express.json());
app.use(categoryRoutes);

describe("Delete Category - Integration Tests", () => {
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
    await Category.destroy({ where: {}, force: true, truncate: true });
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

  // Helper para criar categoria no banco antes do teste
  const createCategory = async () => {
    return await Category.create(validCategory);
  };

  it("DELETE /v1/category/:id - Deve deletar categoria com sucesso (ADMIN)", async () => {
    const category = await createCategory();
    const token = generateToken(adminPayload);

    const response = await request(app)
      .delete(`/v1/category/${category.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", category.id);
    expect(response.body.name).toBe(validCategory.name);
    expect(response.body.slug).toBe(validCategory.slug);
    expect(response.body.use_in_menu).toBe(validCategory.use_in_menu);

    // Verifica que o soft delete foi aplicado (deleted_at preenchido)
    const deletedCategory = await Category.findByPk(category.id, { paranoid: false });
    expect(deletedCategory).not.toBeNull();
    expect(deletedCategory.deleted_at).not.toBeNull();

    // Verifica que findByPk normal NÃO retorna (paranoid ativo)
    const notFound = await Category.findByPk(category.id);
    expect(notFound).toBeNull();
  });

  it("DELETE /v1/category/:id - Deve retornar 403 se o usuário não for ADMIN", async () => {
    const category = await createCategory();
    const token = generateToken(userPayload);

    const response = await request(app)
      .delete(`/v1/category/${category.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");

    // Garante que a categoria permanece intacta no banco
    const categoryInDb = await Category.findByPk(category.id);
    expect(categoryInDb).not.toBeNull();
    expect(categoryInDb.name).toBe(validCategory.name);
  });

  it("DELETE /v1/category/:id - Deve retornar 401 se não enviar token", async () => {
    const category = await createCategory();

    const response = await request(app)
      .delete(`/v1/category/${category.id}`);

    expect(response.status).toBe(401);

    // Garante que a categoria permanece intacta no banco
    const categoryInDb = await Category.findByPk(category.id);
    expect(categoryInDb).not.toBeNull();
  });

  it("DELETE /v1/category/:id - Deve retornar 401 com token inválido/malformado", async () => {
    const category = await createCategory();

    const response = await request(app)
      .delete(`/v1/category/${category.id}`)
      .set("Authorization", "Bearer token-invalido-malformado");

    expect(response.status).toBe(401);

    // Garante que a categoria permanece intacta no banco
    const categoryInDb = await Category.findByPk(category.id);
    expect(categoryInDb).not.toBeNull();
  });

  it("DELETE /v1/category/:id - Deve retornar 400 quando ID não é UUID válido", async () => {
    const token = generateToken(adminPayload);

    const response = await request(app)
      .delete("/v1/category/id-invalido-nao-uuid")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors[0].field).toBe("id");
  });

  it("DELETE /v1/category/:id - Deve retornar 400 quando categoria não existe", async () => {
    const token = generateToken(adminPayload);
    const fakeId = "00000000-0000-0000-0000-000000000000";

    const response = await request(app)
      .delete(`/v1/category/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/not found/i);
  });

  it("DELETE /v1/category/:id - Deve retornar 400 ao tentar deletar mesma categoria 2x (idempotência soft delete)", async () => {
    const category = await createCategory();
    const token = generateToken(adminPayload);

    // Primeira deleção - sucesso
    const firstResponse = await request(app)
      .delete(`/v1/category/${category.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(firstResponse.status).toBe(200);

    // Segunda deleção - deve falhar (já soft-deletada, findById não encontra)
    const secondResponse = await request(app)
      .delete(`/v1/category/${category.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(secondResponse.status).toBe(400);
    expect(secondResponse.body.error).toMatch(/not found/i);
  });

  it("DELETE /v1/category/:id - Deve ignorar body extra e deletar normalmente", async () => {
    const category = await createCategory();
    const token = generateToken(adminPayload);

    const response = await request(app)
      .delete(`/v1/category/${category.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Hackeado", extra_field: "malicioso", role: "ADMIN" });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(validCategory.name); // Nome original, não o do body

    // Verifica soft delete no banco
    const deletedCategory = await Category.findByPk(category.id, { paranoid: false });
    expect(deletedCategory).not.toBeNull();
    expect(deletedCategory.deleted_at).not.toBeNull();
    expect(deletedCategory.name).toBe(validCategory.name); // Nome intacto
  });
});
