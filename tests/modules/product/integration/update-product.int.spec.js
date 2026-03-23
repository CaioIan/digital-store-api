const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const { Product, Category, ProductOption, sequelize } = require("../../../../src/models");
const productRoutes = require("../../../../src/modules/product/routes/product.routes");

// Setup express app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(productRoutes);
const errorHandler = require("../../../../src/shared/middlewares/error-handler.middleware");
app.use(errorHandler);

describe("Update Product - Integration Tests", () => {
  let testProduct;
  let testCategory;

  beforeAll(async () => {
    try {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
      await sequelize.sync({ force: true });
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
    } catch (error) {
      console.error("Error syncing test database:", error);
      throw error;
    }
  });

  beforeEach(async () => {
    // Create necessary data
    testCategory = await Category.create({
      name: "Test category",
      slug: "test-category",
      use_in_menu: true,
    });

    testProduct = await Product.create({
      name: "Original product",
      slug: "original-product",
      price: 100.0,
      price_with_discount: 90.0,
      stock: 10,
      enabled: true,
      description: "Original Description",
    });
  });

  afterEach(async () => {
    try {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
      await sequelize.sync({ force: true });
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
    } catch (error) {
      console.error("Error in cleanup:", error);
      throw error;
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  const adminPayload = { sub: "admin-id", role: "ADMIN", email: "admin@test.com" };
  const userPayload = { sub: "user-id", role: "USER", email: "user@test.com" };

  // ============ SUCCESS ============

  it("PATCH /v1/product/:id - Deve atualizar o produto com sucesso com dados parciais (ADMIN)", async () => {
    const token = generateToken(adminPayload);
    const updatePayload = {
      price: 150.0,
      name: "Updated Product Name",
    };

    const response = await request(app)
      .patch(`/v1/product/${testProduct.id}`)
      .set("Cookie", `access_token=${token}`)
      .send(updatePayload);

    expect(response.status).toBe(200);
    // Sequelize update returns [numberOfAffectedRows], but repository might return the updated product or just the result.
    // Let's check the DB to be sure.

    const productInDb = await Product.findByPk(testProduct.id);
    expect(productInDb.price).toBe(150.0);
    expect(productInDb.name).toBe("Updated Product Name");
    expect(productInDb.slug).toBe(testProduct.slug); // Should remain unchanged
  });

  it("PATCH /v1/product/:id - Deve atualizar preço e preço com desconto corretamente", async () => {
    const token = generateToken(adminPayload);
    const updatePayload = {
      price: 200.0,
      price_with_discount: 180.0,
    };

    const response = await request(app)
      .patch(`/v1/product/${testProduct.id}`)
      .set("Cookie", `access_token=${token}`)
      .send(updatePayload);

    expect(response.status).toBe(200);

    const productInDb = await Product.findByPk(testProduct.id);
    expect(productInDb.price).toBe(200.0);
    expect(productInDb.price_with_discount).toBe(180.0);
  });

  // ============ PROHIBITED / UNAUTHORIZED ============

  it("PATCH /v1/product/:id - Deve retornar 403 se o usuário não for ADMIN", async () => {
    const token = generateToken(userPayload);
    const updatePayload = { price: 200.0 };

    const response = await request(app)
      .patch(`/v1/product/${testProduct.id}`)
      .set("Cookie", `access_token=${token}`)
      .send(updatePayload);

    expect(response.status).toBe(403);
  });

  it("PATCH /v1/product/:id - Deve retornar 401 se não enviar token", async () => {
    const updatePayload = { price: 200.0 };

    const response = await request(app).patch(`/v1/product/${testProduct.id}`).send(updatePayload);

    expect(response.status).toBe(401);
  });

  // ============ VALIDATION ERRORS ============

  it("PATCH /v1/product/:id - Deve retornar 400 se o preço for negativo", async () => {
    const token = generateToken(adminPayload);
    const updatePayload = { price: -50.0 };

    const response = await request(app)
      .patch(`/v1/product/${testProduct.id}`)
      .set("Cookie", `access_token=${token}`)
      .send(updatePayload);

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "price", message: expect.stringContaining("positivo") }),
      ]),
    );
  });

  it("PATCH /v1/product/:id - Deve retornar 400 se price_with_discount > price", async () => {
    const token = generateToken(adminPayload);
    const updatePayload = {
      price: 100.0,
      price_with_discount: 150.0,
    };

    const response = await request(app)
      .patch(`/v1/product/${testProduct.id}`)
      .set("Cookie", `access_token=${token}`)
      .send(updatePayload);

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "price_with_discount" })]),
    );
  });

  it("PATCH /v1/product/:id - Deve retornar 400 se tentar atualizar com corpo vazio", async () => {
    const token = generateToken(adminPayload);
    const updatePayload = {};

    const response = await request(app)
      .patch(`/v1/product/${testProduct.id}`)
      .set("Cookie", `access_token=${token}`)
      .send(updatePayload);

    expect(response.status).toBe(400);
  });

  it("PATCH /v1/product/:id - Deve retornar 400 ao enviar campos desconhecidos (strict mode)", async () => {
    const token = generateToken(adminPayload);
    const updatePayload = {
      price: 150.0,
      unknown_field: "hacker",
    };

    const response = await request(app)
      .patch(`/v1/product/${testProduct.id}`)
      .set("Cookie", `access_token=${token}`)
      .send(updatePayload);

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "", message: expect.stringContaining("Unrecognized key") }),
      ]),
    );
  });

  // ============ NOT FOUND ============

  it("PATCH /v1/product/:id - Deve retornar 400/404 se o id do produto não existir", async () => {
    const token = generateToken(adminPayload);
    const updatePayload = { price: 150.0 };
    const nonExistentId = 99999;

    const response = await request(app)
      .patch(`/v1/product/${nonExistentId}`)
      .set("Cookie", `access_token=${token}`)
      .send(updatePayload);

    // Initial implementation logic might throw error or return 404/400 depending on service/repo.
    // Controller catches error -> returns 400.
    // Service lança "Recurso não encontrado.".
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch("Recurso não encontrado.");
  });

  it("PATCH /v1/product/:id - Deve retornar 400 se o id for inválido (não numérico)", async () => {
    const token = generateToken(adminPayload);
    const updatePayload = { price: 150.0 };

    const response = await request(app)
      .patch(`/v1/product/abc`)
      .set("Cookie", `access_token=${token}`)
      .send(updatePayload);

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  // ============ ATUALIZAÇÃO DE RELACIONAMENTOS ============

  it("PATCH /v1/product/:id - Deve atualizar opções do produto com sucesso", async () => {
    const token = generateToken(adminPayload);
    const newOptions = [
      {
        title: "Tamanho Novo",
        shape: "circle",
        radius: 0,
        type: "text",
        values: ["XL", "XXL"],
      },
    ];

    const response = await request(app)
      .patch(`/v1/product/${testProduct.id}`)
      .set("Cookie", `access_token=${token}`)
      .send({ options: newOptions });

    expect(response.status).toBe(200);
    expect(response.body.options).toHaveLength(1);
    expect(response.body.options[0].title).toBe("Tamanho Novo");

    // Verifica valores no banco
    const optionsDb = await ProductOption.findAll({ where: { product_id: testProduct.id } });
    expect(optionsDb).toHaveLength(1);
    expect(optionsDb[0].title).toBe("Tamanho Novo");
  });

  it("PATCH /v1/product/:id - Deve atualizar categorias do produto com sucesso", async () => {
    const token = generateToken(adminPayload);
    // Cria nova categoria
    const newCategory = await Category.create({ name: "Nova Cat", slug: "nova-cat", use_in_menu: true });

    const response = await request(app)
      .patch(`/v1/product/${testProduct.id}`)
      .set("Cookie", `access_token=${token}`)
      .send({ category_ids: [newCategory.id] });

    expect(response.status).toBe(200);

    // Verifica se a categoria foi atualizada
    const product = await Product.findByPk(testProduct.id, { include: ["categories"] });
    expect(product.categories).toHaveLength(1);
    expect(product.categories[0].id).toBe(newCategory.id);
  });

  it("PATCH /v1/product/:id - Deve retornar 400 se campos excederem o limite de caracteres", async () => {
    const token = generateToken(adminPayload);
    const longString100 = "a".repeat(101);
    const longString1000 = "a".repeat(1001);
    const longString30 = "a".repeat(31);
    const longString255 = "a".repeat(256);

    const updatePayload = {
      name: longString100,
      slug: longString100,
      description: longString1000,
      options: [
        {
          title: longString30,
          values: [longString255],
          shape: "square",
          radius: 0,
          type: "text",
        },
      ],
    };

    const response = await request(app)
      .patch(`/v1/product/${testProduct.id}`)
      .set("Cookie", `access_token=${token}`)
      .send(updatePayload);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");

    const errors = response.body.errors;
    expect(errors.some((e) => e.message.includes("100 caracteres"))).toBe(true); // name, slug
    expect(errors.some((e) => e.message.includes("1000 caracteres"))).toBe(true); // description
    expect(errors.some((e) => e.message.includes("30 caracteres"))).toBe(true); // option title
    expect(errors.some((e) => e.message.includes("255 caracteres"))).toBe(true); // option value
  });
});
