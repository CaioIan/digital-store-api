const request = require("supertest");
const express = require("express");
const { Product, Category, ProductOption, ProductImage, sequelize } = require("../../../../src/models");
const productRoutes = require("../../../../src/modules/product/routes/product.routes");

const app = express();
app.use(express.json());
app.use(productRoutes);

describe("Get Product By ID - Integration Tests", () => {
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
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
    await Product.destroy({ where: {}, truncate: true, force: true });
    await Category.destroy({ where: {}, truncate: true, force: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  const createScenario = async () => {
    const cat1 = await Category.create({ name: "Sapato", slug: "sapato", use_in_menu: true });

    const p1 = await Product.create({
      name: "Tênis Nike",
      slug: "tenis-nike",
      price: 200,
      price_with_discount: 180,
      enabled: true,
      stock: 10,
      description: "Um tênis esportivo",
    });
    await p1.addCategory(cat1);
    await ProductOption.create({
      product_id: p1.id,
      title: "Tamanho",
      values: JSON.stringify(["40", "41"]),
    });
    await ProductImage.create({ product_id: p1.id, path: "path/to/img1.jpg", enabled: true });

    return { p1, cat1 };
  };

  it("GET /v1/product/:id - Deve retornar produto com sucesso quando ID existe", async () => {
    const { p1 } = await createScenario();

    const response = await request(app).get(`/v1/product/${p1.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(p1.id);
    expect(response.body.name).toBe(p1.name);
    expect(response.body.categories).toHaveLength(1);
    expect(response.body.options).toHaveLength(1);
    expect(response.body.images).toHaveLength(1);
  });

  it("GET /v1/product/:id - Deve retornar 400 se ID não for numérico (Validator)", async () => {
    const response = await request(app).get("/v1/product/abc");

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    // Mensagem pode variar dependendo do Zod error map, mas "expected number" ou similar
  });

  it("GET /v1/product/:id - Deve retornar 400 se ID for negativo (Validator)", async () => {
    const response = await request(app).get("/v1/product/-1");

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("GET /v1/product/:id - Deve retornar 400 se produto não for encontrado (Service)", async () => {
    const response = await request(app).get("/v1/product/999999");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Product not found");
  });
});
