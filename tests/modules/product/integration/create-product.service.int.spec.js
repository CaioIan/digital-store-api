const request = require("supertest");
const express = require("express");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const { Product, Category, ProductImage, ProductOption, sequelize } = require("../../../../src/models");
const productRoutes = require("../../../../src/modules/product/routes/product.routes");

// Mock do Cloudinary para evitar uploads reais nos testes
jest.mock("../../../../src/config/cloudinary.config", () => ({
  uploader: {
    upload: jest.fn().mockResolvedValue({
      secure_url: "https://res.cloudinary.com/test/image/upload/v1/test.jpg",
    }),
  },
}));

// Setup da aplicação Express para o teste
const app = express();
app.use(express.json());
app.use(productRoutes);

describe("Create Product - Integration Tests", () => {
  let testCategory;

  beforeAll(async () => {
    try {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
      await sequelize.sync({ force: true });
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
    } catch (error) {
      console.error("Erro ao sincronizar banco de dados de teste:", error);
      throw error;
    }
  });

  beforeEach(async () => {
    // Cria uma categoria para usar nos testes
    testCategory = await Category.create({
      name: "Test Category",
      slug: "test-category",
      use_in_menu: true,
    });
  });

  afterEach(async () => {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
    await ProductOption.destroy({ where: {}, truncate: true, force: true });
    await ProductImage.destroy({ where: {}, truncate: true, force: true });
    await Product.destroy({ where: {}, truncate: true, force: true });
    await Category.destroy({ where: {}, truncate: true, force: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  const adminPayload = { sub: "admin-id", role: "ADMIN", email: "admin@test.com" };
  const userPayload = { sub: "user-id", role: "USER", email: "user@test.com" };

  const validProductComplete = {
    enabled: true,
    name: "Produto Teste",
    slug: "produto-teste",
    use_in_menu: true,
    stock: 10,
    description: "Descrição do produto teste",
    price: 119.9,
    price_with_discount: 99.9,
    category_ids: [],
    images: [
      {
        type: "image/png",
        content: "https://res.cloudinary.com/test/image/upload/v1/sample.jpg",
      },
    ],
    options: [
      {
        title: "Cor",
        shape: "square",
        radius: 4,
        type: "text",
        values: ["P", "M", "G"],
      },
    ],
  };

  const validProductMinimal = {
    name: "Produto Mínimo",
    slug: "produto-minimo",
    price: 50.0,
    price_with_discount: 45.0,
  };

  // ============ SUCESSO ============

  it("POST /v1/product - Deve criar produto completo com sucesso (ADMIN)", async () => {
    const token = generateToken(adminPayload);
    const payload = { ...validProductComplete, category_ids: [testCategory.id] };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(payload.name);
    expect(response.body.slug).toBe(payload.slug);
    expect(response.body.images).toHaveLength(1);
    expect(response.body.options).toHaveLength(1);
    expect(response.body.category_ids).toEqual([testCategory.id]);

    const productInDb = await Product.findOne({ where: { slug: payload.slug } });
    expect(productInDb).not.toBeNull();
  });

  it("POST /v1/product - Deve criar produto mínimo com sucesso (ADMIN)", async () => {
    const token = generateToken(adminPayload);

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(validProductMinimal);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(validProductMinimal.name);
    expect(response.body.images).toEqual([]);
    expect(response.body.options).toEqual([]);
    expect(response.body.category_ids).toEqual([]);
  });

  it("POST /v1/product - Deve criar produto sem images com sucesso (ADMIN)", async () => {
    const token = generateToken(adminPayload);
    const payload = { ...validProductComplete, images: [], category_ids: [testCategory.id] };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.status).toBe(201);
    expect(response.body.images).toEqual([]);
  });

  it("POST /v1/product - Deve criar produto sem options com sucesso (ADMIN)", async () => {
    const token = generateToken(adminPayload);
    const payload = { ...validProductComplete, options: [], category_ids: [testCategory.id] };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.status).toBe(201);
    expect(response.body.options).toEqual([]);
  });

  it("POST /v1/product - Deve criar produto sem categories com sucesso (ADMIN)", async () => {
    const token = generateToken(adminPayload);
    const payload = { ...validProductComplete, category_ids: [] };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.status).toBe(201);
    expect(response.body.category_ids).toEqual([]);
  });

  // ============ AUTENTICAÇÃO / AUTORIZAÇÃO ============

  it("POST /v1/product - Deve retornar 403 se o usuário não for ADMIN", async () => {
    const token = generateToken(userPayload);

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(validProductMinimal);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");

    const count = await Product.count();
    expect(count).toBe(0);
  });

  it("POST /v1/product - Deve retornar 401 se não enviar token", async () => {
    const response = await request(app).post("/v1/product").send(validProductMinimal);

    expect(response.status).toBe(401);
  });

  // ============ VALIDAÇÃO DE CAMPOS ============

  it("POST /v1/product - Deve retornar 400 se faltar campos obrigatórios (name)", async () => {
    const token = generateToken(adminPayload);
    const invalidData = { slug: "test", price: 100, price_with_discount: 90 };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: "name" })]));
  });

  it("POST /v1/product - Deve retornar 400 se stock for negativo", async () => {
    const token = generateToken(adminPayload);
    const invalidData = { ...validProductMinimal, stock: -5 };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "stock", message: expect.stringContaining("negative") })]),
    );
  });

  it("POST /v1/product - Deve retornar 400 se price_with_discount > price", async () => {
    const token = generateToken(adminPayload);
    const invalidData = { ...validProductMinimal, price: 50, price_with_discount: 100 };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "price_with_discount" })]),
    );
  });

  it("POST /v1/product - Deve retornar 400 se slug já existir (duplicado)", async () => {
    const token = generateToken(adminPayload);

    await Product.create(validProductMinimal);

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(validProductMinimal);

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/já existe/i);
  });

  it("POST /v1/product - Deve retornar 400 se name já existir (duplicado)", async () => {
    const token = generateToken(adminPayload);

    await Product.create(validProductMinimal);

    const duplicateNameData = { ...validProductMinimal, slug: "outro-slug" };
    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(duplicateNameData);

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/já existe/i);
  });

  it("POST /v1/product - Deve retornar 400 se category_ids contiver UUID inválido (não existe)", async () => {
    const token = generateToken(adminPayload);
    const invalidData = { ...validProductMinimal, category_ids: ["00000000-0000-0000-0000-000000000000"] };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/não encontradas/i);
  });

  it("POST /v1/product - Deve retornar 400 se category_ids contiver UUID malformado", async () => {
    const token = generateToken(adminPayload);
    const invalidData = { ...validProductMinimal, category_ids: ["not-a-uuid"] };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  // ============ TENTATIVAS MALICIOSAS ============

  it("POST /v1/product - Deve retornar 400 se enviar campos extras (malicious)", async () => {
    const token = generateToken(adminPayload);
    const maliciousData = { ...validProductMinimal, is_admin: true, role: "SUPERUSER" };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(maliciousData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("POST /v1/product - Deve retornar 400 se enviar enum inválido (shape)", async () => {
    const token = generateToken(adminPayload);
    const invalidData = {
      ...validProductMinimal,
      options: [{ title: "Test", shape: "triangle", type: "text", values: ["A"] }],
    };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });
});
