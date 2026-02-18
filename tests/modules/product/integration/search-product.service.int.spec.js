const request = require("supertest");
const express = require("express");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const { Product, Category, ProductOption, ProductImage, sequelize } = require("../../../../src/models");
const productRoutes = require("../../../../src/modules/product/routes/product.routes");

const app = express();
app.use(express.json());
app.use(productRoutes);

describe("List Products - Integration Tests", () => {
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

  const adminPayload = { sub: "admin-id", role: "ADMIN", email: "admin@test.com" };
  const token = generateToken(adminPayload); // Rotas de listagem são públicas ou precisam de token? O endpoint não tem middleware de auth no get, então deve ser publico.
  // Verificando rotas: router.get("/v1/product/list-products", listProductsValidator, ListProductsController.handle); -> PÚBLICO

  const createScenario = async () => {
    // Cria categorias
    const cat1 = await Category.create({ name: "Sapato", slug: "sapato", use_in_menu: true });
    const cat2 = await Category.create({ name: "Camisa", slug: "camisa", use_in_menu: true });

    // Cria produtos
    // Produto 1: Tênis Nike (Cat: Sapato, Price: 200, Option: 40, Color: Red)
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

    // Produto 2: Camisa Polo (Cat: Camisa, Price: 100)
    const p2 = await Product.create({
      name: "Camisa Polo",
      slug: "camisa-polo",
      price: 100,
      price_with_discount: 90,
      enabled: true,
      stock: 20,
      description: "Camisa algodão",
    });
    await p2.addCategory(cat2);

    // Produto 3: Tênis Adidas (Cat: Sapato, Price: 300)
    const p3 = await Product.create({
      name: "Tênis Adidas",
      slug: "tenis-adidas",
      price: 300,
      price_with_discount: 280,
      enabled: true,
      stock: 5,
      description: "Outro tênis",
    });
    await p3.addCategory(cat1);

    // Cria mais 10 produtos genéricos para testar paginação (Total 13)
    for (let i = 0; i < 10; i++) {
        await Product.create({
            name: `Produto Genérico ${i}`,
            slug: `produto-generico-${i}`,
            price: 50 + i,
            price_with_discount: 50 + i,
            enabled: true,
            stock: 100,
        });
    }

    return { cat1, cat2, p1, p2, p3 };
  };

  it("GET /v1/product/list-products - Deve retornar lista paginada padrão (12 itens)", async () => {
    await createScenario();

    const response = await request(app).get("/v1/product/list-products");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(12);
    expect(response.body.total).toBe(13);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(12);
  });

  it("GET /v1/product/list-products - Deve respeitar paginação", async () => {
    await createScenario();

    const response = await request(app).get("/v1/product/list-products?page=2&limit=5");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(5);
    expect(response.body.page).toBe(2);
    expect(response.body.limit).toBe(5);
  });

  it("GET /v1/product/list-products - Deve retornar todos se limit for -1", async () => {
    await createScenario();

    const response = await request(app).get("/v1/product/list-products?limit=-1");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(13);
    expect(response.body.limit).toBe(-1);
  });

  it("GET /v1/product/list-products - Deve filtrar por match (nome)", async () => {
    await createScenario();

    const response = await request(app).get("/v1/product/list-products?match=Nike");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe("Tênis Nike");
  });

  it("GET /v1/product/list-products - Deve filtrar por categorias", async () => {
    const { cat1 } = await createScenario(); // cat1 = Sapato (tem 2 produtos: Nike e Adidas)

    const response = await request(app).get(`/v1/product/list-products?category_ids=${cat1.id}`);

    expect(response.status).toBe(200);
    // Nike e Adidas
    expect(response.body.data).toHaveLength(2);
    response.body.data.forEach(p => {
        const hasCat = p.categories.some(c => c.id === cat1.id);
        expect(hasCat).toBe(true);
    });
  });

  it("GET /v1/product/list-products - Deve filtrar por range de preço", async () => {
    await createScenario();

    // Produtos: 100 (Polo), 200 (Nike), 300 (Adidas), e genericos 50-60
    // Range 150-250 deve pegar só o Nike (200)
    const response = await request(app).get("/v1/product/list-products?price-range=150-250");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].price).toBe(200);
  });

  it("GET /v1/product/list-products - Deve filtrar por opção específica", async () => {
    const { p1 } = await createScenario(); 
    // p1 tem option "Tamanho" com values ["40", "41"]
    
    // Pega o ID da option criada
    const option = await ProductOption.findOne({ where: { product_id: p1.id } });
    
    // Busca por option[id]=40
    const response = await request(app).get(`/v1/product/list-products?option[${option.id}]=40`);

    try {
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe(p1.id);
    } catch (e) {
        require('fs').writeFileSync('failure.log', JSON.stringify({
            status: response.status,
            body: response.body,
            queryURL: `/v1/product/list-products?option[${option.id}]=40`
        }, null, 2));
        throw e;
    }
  });

  it("GET /v1/product/list-products - Deve projetar campos (fields)", async () => {
    await createScenario();

    const response = await request(app).get("/v1/product/list-products?fields=name,slug");

    expect(response.status).toBe(200);
    const product = response.body.data[0];
    expect(product).toHaveProperty("name");
    expect(product).toHaveProperty("slug");
    expect(product).toHaveProperty("id"); // ID é forçado sempre
    expect(product.price).toBeUndefined(); // Não pediu price
  });

  it("GET /v1/product/list-products - Deve retornar 400 para limit inválido", async () => {
    const response = await request(app).get("/v1/product/list-products?limit=-5");

    expect(response.status).toBe(400);
    expect(response.body.errors[0].message).toMatch(/limit must be positive/i);
  });

  it("GET /v1/product/list-products - Deve retornar 400 para price-range inválido", async () => {
      const response = await request(app).get("/v1/product/list-products?price-range=abc");

      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toMatch(/price range must be in format/i);
  });

  it("GET /v1/product/list-products - Deve sanitizar input evitando SQL Injection (básico)", async () => {
      await createScenario();
      // Tenta passar um comando SQL no match
      const response = await request(app).get("/v1/product/list-products?match=' OR '1'='1");

      // Se funcionar a injection, retornaria tudo porque '1'='1' (13 itens)
      // Se estiver seguro, vai procurar um produto com esse nome literal e retornar 0
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
  });
});
