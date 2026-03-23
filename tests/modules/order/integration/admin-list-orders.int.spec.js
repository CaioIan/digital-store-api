const request = require("supertest");
const app = require("../../../../src/app");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const { sequelize, Category, Product, Cart, CartItem } = require("../../../../src/models");
const { createTestUser, createTestAdmin } = require("../../../helpers/test-database.helper");

describe("Order Route - GET /v1/admin/orders", () => {
  let admin;
  let user1;
  let user2;
  let adminToken;
  let userToken;
  let product;

  const checkoutPayload = {
    personal_info: {
      full_name: "Cliente Teste",
      cpf: "123.485.913-35",
      email: "cliente@test.com",
      phone: "85999999999",
    },
    delivery_address: {
      address: "Rua Teste",
      neighborhood: "Centro",
      city: "Fortaleza",
      cep: "60000-000",
      complement: "Apto 1",
    },
    payment: {
      method: "boleto",
    },
  };

  async function resetDatabase() {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
    await sequelize.sync({ force: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
  }

  async function createOrderForUser(user, token, quantity = 1) {
    const cart = await Cart.create({ user_id: user.id });
    await CartItem.create({
      cart_id: cart.id,
      product_id: product.id,
      quantity,
    });

    const response = await request(app)
      .post("/v1/orders")
      .set("Cookie", [`access_token=${token}`])
      .send(checkoutPayload);

    expect(response.status).toBe(201);
    return response.body.order_id;
  }

  beforeAll(async () => {
    await resetDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();

    admin = await createTestAdmin({ email: "admin-orders-list@test.com" });
    user1 = await createTestUser({ email: "orders-list-user1@test.com" });
    user2 = await createTestUser({ email: "orders-list-user2@test.com" });

    adminToken = generateToken({ sub: admin.id, role: admin.role });
    userToken = generateToken({ sub: user1.id, role: user1.role });

    const category = await Category.create({ name: "Categoria Admin Orders", slug: "categoria-admin-orders", use_in_menu: true });
    product = await Product.create({
      enabled: true,
      name: "Produto Admin Orders",
      slug: "produto-admin-orders",
      stock: 100,
      description: "Produto para testes de admin orders",
      price: 120,
      price_with_discount: 100,
      category_id: category.id,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("ADMIN deve listar todos os pedidos", async () => {
    await createOrderForUser(user1, generateToken({ sub: user1.id, role: user1.role }), 2);
    await createOrderForUser(user2, generateToken({ sub: user2.id, role: user2.role }), 1);

    const response = await request(app)
      .get("/v1/admin/orders?limit=10&page=1")
      .set("Cookie", [`access_token=${adminToken}`]);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.total).toBe(2);
    expect(response.body.data).toHaveLength(2);
  });

  it("ADMIN deve filtrar pedidos por userId", async () => {
    await createOrderForUser(user1, generateToken({ sub: user1.id, role: user1.role }), 1);
    await createOrderForUser(user2, generateToken({ sub: user2.id, role: user2.role }), 1);

    const response = await request(app)
      .get(`/v1/admin/orders?userId=${user1.id}`)
      .set("Cookie", [`access_token=${adminToken}`]);

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].client.email).toBe("cliente@test.com");
  });

  it("USER deve receber 403 ao tentar listar pedidos admin", async () => {
    const response = await request(app)
      .get("/v1/admin/orders")
      .set("Cookie", [`access_token=${userToken}`]);

    expect(response.status).toBe(403);
  });

  it("deve retornar 401 sem autenticação", async () => {
    const response = await request(app).get("/v1/admin/orders");
    expect(response.status).toBe(401);
  });
});
