const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const { Category, sequelize } = require("../../../../src/models");
const categoryRoutes = require("../../../../src/modules/category/routes/category.routes");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(categoryRoutes);
const errorHandler = require("../../../../src/shared/middlewares/error-handler.middleware");
app.use(errorHandler);

describe("Search Category - Integration Tests", () => {
  const adminPayload = { sub: "admin-category-search", role: "ADMIN", email: "admin@cat-search.com" };
  const token = generateToken(adminPayload);

  beforeAll(async () => {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
    await sequelize.sync({ force: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
  });

  beforeEach(async () => {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
    await Category.destroy({ where: {}, truncate: true, force: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });

    await Category.bulkCreate([
      { name: "Games", slug: "games", use_in_menu: true },
      { name: "Eletrônicos", slug: "eletronicos", use_in_menu: true },
      { name: "Casa", slug: "casa", use_in_menu: false },
    ]);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("GET /v1/category/search - deve listar categorias com paginação padrão", async () => {
    const response = await request(app)
      .get("/v1/category/search")
      .set("Cookie", `access_token=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("total", 3);
    expect(response.body).toHaveProperty("limit", 12);
    expect(response.body).toHaveProperty("page", 1);
  });

  it("GET /v1/category/search - deve filtrar por use_in_menu=true", async () => {
    const response = await request(app)
      .get("/v1/category/search?use_in_menu=true")
      .set("Cookie", `access_token=${token}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.data.every((item) => item.use_in_menu === true)).toBe(true);
  });

  it("GET /v1/category/search - deve projetar campos com fields", async () => {
    const response = await request(app)
      .get("/v1/category/search?fields=name,slug")
      .set("Cookie", `access_token=${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toHaveProperty("id");
    expect(response.body.data[0]).toHaveProperty("name");
    expect(response.body.data[0]).toHaveProperty("slug");
    expect(response.body.data[0].use_in_menu).toBeUndefined();
  });

  it("GET /v1/category/search - deve retornar 400 para limit inválido", async () => {
    const response = await request(app)
      .get("/v1/category/search?limit=-5")
      .set("Cookie", `access_token=${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("GET /v1/category/search - deve retornar 401 sem autenticação", async () => {
    const response = await request(app).get("/v1/category/search");
    expect(response.status).toBe(401);
  });
});
