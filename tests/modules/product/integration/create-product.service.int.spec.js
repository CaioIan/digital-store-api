const request = require("supertest");
const express = require("express");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const { Product, Category, ProductImage, ProductOption, sequelize } = require("../../../../src/models");
const productRoutes = require("../../../../src/modules/product/routes/product.routes");

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
    try {
      // Força a recriação das tabelas para garantir estado limpo e IDs resetados
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
      await sequelize.sync({ force: true });
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
    } catch (error) {
      console.error("Erro no cleanup:", error);
      throw error;
    }
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

  it("POST /v1/product - Deve criar produto mínimo com sucesso e aplicar defaults (ADMIN)", async () => {
    const token = generateToken(adminPayload);

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(validProductMinimal);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(validProductMinimal.name);
    expect(response.body.price).toBe(validProductMinimal.price);
    
    // Verificando defaults
    expect(response.body.enabled).toBe(false);
    expect(response.body.use_in_menu).toBe(false);
    expect(response.body.stock).toBe(0);
    expect(response.body.images).toEqual([]);
    expect(response.body.options).toEqual([]);
    expect(response.body.category_ids).toEqual([]);
  });

  // ============ FALHAS DE VALIDAÇÃO (CAMPOS OBRIGATÓRIOS) ============
  // Apenas name, slug e price são obrigatórios agora. 
  // enabled, stock, etc são opcionais com default.

  it("POST /v1/product - Deve retornar 400 se faltar campo 'name'", async () => {
    const token = generateToken(adminPayload);
    const invalidData = { slug: "test", price: 100 };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: "name" })]));
  });

  it("POST /v1/product - Deve retornar 400 se faltar campo 'price'", async () => {
    const token = generateToken(adminPayload);
    const invalidData = { name: "Test", slug: "test" };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: "price" })]));
  });

  // ============ AUTENTICAÇÃO / AUTORIZAÇÃO ============

  it("POST /v1/product - Deve retornar 403 se o usuário não for ADMIN", async () => {
    const token = generateToken(userPayload);
    const payload = { ...validProductComplete, category_ids: [testCategory.id] };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");

    const count = await Product.count();
    expect(count).toBe(0);
  });

  it("POST /v1/product - Deve retornar 401 se não enviar token", async () => {
    // Payload qualquer, já que vai falhar no token
    const response = await request(app).post("/v1/product").send(validProductComplete);

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
    const invalidData = { ...validProductComplete, stock: -5, category_ids: [testCategory.id] };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "stock", message: expect.stringContaining("negative") })]),
    );
  });

  it("POST /v1/product - Deve retornar 400 se price_with_discount > price", async () => {
    const token = generateToken(adminPayload);
    const invalidData = { ...validProductComplete, price: 50, price_with_discount: 100, category_ids: [testCategory.id] };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "price_with_discount" })]),
    );
  });

  it("POST /v1/product - Deve retornar 400 se slug já existir (duplicado)", async () => {
    const token = generateToken(adminPayload);
    const payload = { ...validProductComplete, category_ids: [testCategory.id] };

    // Cria o primeiro produto
    await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(payload);

    // Tenta criar o segundo com mesmo slug
    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/já existe/i);
  });

  it("POST /v1/product - Deve retornar 400 se name já existir (duplicado)", async () => {
    const token = generateToken(adminPayload);
    const payload = { ...validProductComplete, category_ids: [testCategory.id] };

    // Cria o primeiro produto
    await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(payload);

    // Tenta criar o segundo com mesmo nome (mesmo que slug mude)
    const duplicateNameData = { ...payload, slug: "outro-slug" };
    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(duplicateNameData);

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/já existe/i);
  });

  it("POST /v1/product - Deve retornar 400 se category_ids contiver UUID inválido (não existe)", async () => {
    const token = generateToken(adminPayload);
    const invalidData = { ...validProductComplete, category_ids: ["00000000-0000-0000-0000-000000000000"] };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/não encontradas/i);
  });

  it("POST /v1/product - Deve retornar 400 se category_ids contiver UUID malformado", async () => {
    const token = generateToken(adminPayload);
    const invalidData = { ...validProductComplete, category_ids: ["not-a-uuid"] };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("POST /v1/product - Deve retornar 400 se images[].content não for URL válida", async () => {
    const token = generateToken(adminPayload);
    const invalidData = {
      ...validProductComplete,
      category_ids: [testCategory.id],
      images: [
        {
          type: "image/png",
          content: "iVBORw0KGgoAAAANSUhEUgAAAAUA", // base64 ao invés de URL
        },
      ],
    };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("URL"),
        }),
      ])
    );
  });

  // ============ TENTATIVAS MALICIOSAS ============

  it("POST /v1/product - Deve retornar 400 se enviar campos extras (malicious)", async () => {
    const token = generateToken(adminPayload);
    const maliciousData = { ...validProductComplete, category_ids: [testCategory.id], is_admin: true, role: "SUPERUSER" };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(maliciousData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("POST /v1/product - Deve retornar 400 se enviar enum inválido (shape)", async () => {
    const token = generateToken(adminPayload);
    const invalidData = {
      ...validProductComplete,
      category_ids: [testCategory.id],
      options: [{ title: "Test", shape: "triangle", type: "text", values: ["A"] }],
    };

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("POST /v1/product - Deve retornar 400 se campos excederem o limite de caracteres", async () => {
    const token = generateToken(adminPayload);
    const longString100 = "a".repeat(101);
    const longString1000 = "a".repeat(1001);
    const longString30 = "a".repeat(31);
    const longString255 = "a".repeat(256);

    const invalidData = {
      ...validProductComplete,
      name: longString100,
      slug: longString100,
      description: longString1000,
      category_ids: [testCategory.id],
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

    const response = await request(app).post("/v1/product").set("Authorization", `Bearer ${token}`).send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    
    // Verificando se todos os campos inválidos foram capturados
    const errors = response.body.errors;
    // Name e Slug tem limite de 100
    expect(errors.some(e => e.message.includes("100 characters"))).toBe(true); 
    // Description tem limite de 1000
    expect(errors.some(e => e.message.includes("1000 characters"))).toBe(true); 
    // Option Title tem limite de 30
    expect(errors.some(e => e.message.includes("30 characters"))).toBe(true); 
    // Option Value tem limite de 255
    expect(errors.some(e => e.message.includes("255 characters"))).toBe(true); 
  });
});
