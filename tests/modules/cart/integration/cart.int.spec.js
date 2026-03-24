const request = require("supertest");
const app = require("../../../../src/app");
const { sequelize, User, Product, Cart, CartItem, ProductImage } = require("../../../../src/models");
const { generateToken } = require("../../../../src/shared/auth/jwt");

describe("Cart Module Integration Tests", () => {
  let userA;
  let userB;
  let tokenA;
  let tokenB;
  let product1;
  let product2;
  let disabledProduct;

  beforeAll(async () => {
    try {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
      await sequelize.sync({ force: true });
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
    } catch (error) {
      console.error("Erro ao sincronizar banco de dados de teste:", error);
      throw error;
    }

    // Cria dois usuários para testar ownership
    userA = await User.create({
      firstname: "User",
      surname: "A",
      cpf: "11111111101",
      phone: "11911111101",
      email: "usera@example.com",
      password: "password123",
      role: "USER",
    });

    userB = await User.create({
      firstname: "User",
      surname: "B",
      cpf: "22222222202",
      phone: "11922222202",
      email: "userb@example.com",
      password: "password123",
      role: "USER",
    });

    tokenA = generateToken({ sub: userA.id, role: userA.role });
    tokenB = generateToken({ sub: userB.id, role: userB.role });

    // Cria produtos para os testes
    product1 = await Product.create({
      name: "Tênis Nike",
      slug: "tenis-nike",
      price: 200.0,
      price_with_discount: 150.0,
      enabled: true,
      stock: 10,
      description: "Tênis esportivo",
    });

    product2 = await Product.create({
      name: "Camiseta Adidas",
      slug: "camiseta-adidas",
      price: 100.0,
      price_with_discount: 80.0,
      enabled: true,
      stock: 5,
    });

    disabledProduct = await Product.create({
      name: "Produto Desabilitado",
      slug: "produto-desabilitado",
      price: 50.0,
      price_with_discount: 40.0,
      enabled: false,
      stock: 0,
    });

    // Cria imagem para o produto 1
    await ProductImage.create({
      product_id: product1.id,
      path: "https://example.com/tenis.jpg",
      enabled: true,
    });
  });

  afterEach(async () => {
    // Limpa apenas os itens do carrinho entre cada teste
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
    await CartItem.destroy({ where: {}, truncate: true, force: true });
    await Cart.destroy({ where: {}, truncate: true, force: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // ==========================================
  // GET /v1/cart — Listar Carrinho
  // ==========================================
  describe("GET /v1/cart", () => {
    it("deve retornar carrinho vazio quando não há itens", async () => {
      const response = await request(app)
        .get("/v1/cart")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(response.status).toBe(200);
      expect(response.body.cart).toBeDefined();
      expect(response.body.cart.items).toEqual([]);
    });

    it("deve retornar itens com dados do produto populados", async () => {
      // Cria carrinho e item manualmente
      const cart = await Cart.create({ user_id: userA.id });
      await CartItem.create({
        cart_id: cart.id,
        product_id: product1.id,
        quantity: 2,
        selected_color: "Preto",
        selected_size: "42",
      });

      const response = await request(app)
        .get("/v1/cart")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(response.status).toBe(200);
      expect(response.body.cart.items).toHaveLength(1);

      const item = response.body.cart.items[0];
      expect(item.quantity).toBe(2);
      expect(item.selected_color).toBe("Preto");
      expect(item.selected_size).toBe("42");
      expect(item.product).toBeDefined();
      expect(item.product.name).toBe("Tênis Nike");
      expect(item.product.price).toBe(200.0);
      expect(item.product.price_with_discount).toBe(150.0);
      expect(item.product.images).toBeDefined();
      expect(item.product.images).toHaveLength(1);
    });

    it("deve retornar 401 sem token", async () => {
      const response = await request(app).get("/v1/cart");
      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // POST /v1/cart/add — Adicionar Produto
  // ==========================================
  describe("POST /v1/cart/add", () => {
    it("deve adicionar um produto ao carrinho", async () => {
      const response = await request(app)
        .post("/v1/cart/add")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          product_id: product1.id,
          quantity: 1,
          selected_color: "Azul",
          selected_size: "42",
        });

      expect(response.status).toBe(201);
      expect(response.body.product_id).toBe(product1.id);
      expect(response.body.quantity).toBe(1);
      expect(response.body.selected_color).toBe("Azul");
    });

    it("deve somar a quantidade quando o mesmo item já existe", async () => {
      // Adiciona pela primeira vez
      await request(app)
        .post("/v1/cart/add")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          product_id: product1.id,
          quantity: 2,
          selected_color: "Azul",
          selected_size: "42",
        });

      // Adiciona novamente — deve somar
      const response = await request(app)
        .post("/v1/cart/add")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          product_id: product1.id,
          quantity: 3,
          selected_color: "Azul",
          selected_size: "42",
        });

      expect(response.status).toBe(201);
      expect(response.body.quantity).toBe(5); // 2 + 3
    });

    it("deve criar novo item quando cor/tamanho for diferente", async () => {
      await request(app)
        .post("/v1/cart/add")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          product_id: product1.id,
          quantity: 1,
          selected_color: "Azul",
          selected_size: "42",
        });

      await request(app)
        .post("/v1/cart/add")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          product_id: product1.id,
          quantity: 1,
          selected_color: "Preto",
          selected_size: "44",
        });

      // Verifica que existem 2 itens diferentes
      const listResponse = await request(app)
        .get("/v1/cart")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(listResponse.body.cart.items).toHaveLength(2);
    });

    it("deve rejeitar product_id inexistente (404)", async () => {
      const response = await request(app)
        .post("/v1/cart/add")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ product_id: 99999, quantity: 1 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Produto não encontrado.");
    });

    it("deve rejeitar produto desabilitado (400)", async () => {
      const response = await request(app)
        .post("/v1/cart/add")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ product_id: disabledProduct.id, quantity: 1 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Produto não está disponível.");
    });

    it("deve retornar 400 com body inválido", async () => {
      const response = await request(app)
        .post("/v1/cart/add")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ quantity: 1 }); // sem product_id

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("deve retornar 401 sem token", async () => {
      const response = await request(app)
        .post("/v1/cart/add")
        .send({ product_id: product1.id, quantity: 1 });

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // PUT /v1/cart/update/:itemId — Atualizar Quantidade
  // ==========================================
  describe("PUT /v1/cart/update/:itemId", () => {
    it("deve atualizar a quantidade de um item", async () => {
      // Cria item
      const addResponse = await request(app)
        .post("/v1/cart/add")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ product_id: product1.id, quantity: 1 });

      const itemId = addResponse.body.id;

      const response = await request(app)
        .put(`/v1/cart/update/${itemId}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(5);
    });

    it("deve retornar 403 ao tentar atualizar item de outro usuário", async () => {
      // Usuário A adiciona item
      const addResponse = await request(app)
        .post("/v1/cart/add")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ product_id: product1.id, quantity: 1 });

      const itemId = addResponse.body.id;

      // Usuário B tenta atualizar
      const response = await request(app)
        .put(`/v1/cart/update/${itemId}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ quantity: 10 });

      expect(response.status).toBe(403);
    });

    it("deve retornar 404 para itemId inexistente", async () => {
      const fakeUuid = "00000000-0000-0000-0000-000000000000";
      const response = await request(app)
        .put(`/v1/cart/update/${fakeUuid}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(404);
    });

    it("deve retornar 400 para itemId inválido (não UUID)", async () => {
      const response = await request(app)
        .put("/v1/cart/update/invalid-id")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  // ==========================================
  // DELETE /v1/cart/remove/:itemId — Remover Produto
  // ==========================================
  describe("DELETE /v1/cart/remove/:itemId", () => {
    it("deve remover um item do carrinho", async () => {
      const addResponse = await request(app)
        .post("/v1/cart/add")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ product_id: product1.id, quantity: 1 });

      const itemId = addResponse.body.id;

      const response = await request(app)
        .delete(`/v1/cart/remove/${itemId}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(response.status).toBe(204);

      // Verifica que o carrinho está vazio
      const listResponse = await request(app)
        .get("/v1/cart")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(listResponse.body.cart.items).toHaveLength(0);
    });

    it("deve retornar 403 ao tentar remover item de outro usuário", async () => {
      const addResponse = await request(app)
        .post("/v1/cart/add")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ product_id: product1.id, quantity: 1 });

      const itemId = addResponse.body.id;

      const response = await request(app)
        .delete(`/v1/cart/remove/${itemId}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(response.status).toBe(403);
    });

    it("deve retornar 404 para itemId inexistente", async () => {
      const fakeUuid = "00000000-0000-0000-0000-000000000000";
      const response = await request(app)
        .delete(`/v1/cart/remove/${fakeUuid}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
    });
  });

  // ==========================================
  // DELETE /v1/cart/clear — Limpar Carrinho
  // ==========================================
  describe("DELETE /v1/cart/clear", () => {
    it("deve limpar todos os itens do carrinho", async () => {
      // Adiciona dois produtos
      await request(app)
        .post("/v1/cart/add")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ product_id: product1.id, quantity: 2 });

      await request(app)
        .post("/v1/cart/add")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ product_id: product2.id, quantity: 1 });

      const response = await request(app)
        .delete("/v1/cart/clear")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(response.status).toBe(204);

      // Verifica que o carrinho está vazio
      const listResponse = await request(app)
        .get("/v1/cart")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(listResponse.body.cart.items).toHaveLength(0);
    });

    it("deve retornar 204 mesmo com carrinho vazio", async () => {
      const response = await request(app)
        .delete("/v1/cart/clear")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(response.status).toBe(204);
    });

    it("deve retornar 401 sem token", async () => {
      const response = await request(app).delete("/v1/cart/clear");
      expect(response.status).toBe(401);
    });
  });
});
