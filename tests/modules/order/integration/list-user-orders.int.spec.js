const request = require("supertest");
const app = require("../../../../src/app");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const { sequelize, Category, Product, Cart, CartItem } = require("../../../../src/models");
const { createTestUser, createTestAdmin } = require("../../../helpers/test-database.helper");

describe("Order Route - GET /v1/orders", () => {
  let user1;
  let user2;
  let user1Token;
  let user2Token;
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

    user1 = await createTestUser({ email: "orders-user1@test.com" });
    user2 = await createTestUser({ email: "orders-user2@test.com" });
    await createTestAdmin({ email: "orders-admin@test.com" });

    user1Token = generateToken({ sub: user1.id, role: user1.role });
    user2Token = generateToken({ sub: user2.id, role: user2.role });

    const category = await Category.create({ name: "Categoria Orders", slug: "categoria-orders", use_in_menu: true });
    product = await Product.create({
      enabled: true,
      name: "Produto Orders",
      slug: "produto-orders",
      stock: 100,
      description: "Produto para testes de orders",
      price: 100,
      price_with_discount: 80,
      category_id: category.id,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("deve listar apenas pedidos do usuário autenticado", async () => {
    const orderUser1 = await createOrderForUser(user1, user1Token, 2);
    await createOrderForUser(user2, user2Token, 1);

    const response = await request(app)
      .get("/v1/orders")
      .set("Cookie", [`access_token=${user1Token}`]);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toHaveProperty("id", orderUser1);
  });

  it("deve respeitar paginação na listagem de pedidos do usuário", async () => {
    await createOrderForUser(user1, user1Token, 1);
    await createOrderForUser(user1, user1Token, 2);
    await createOrderForUser(user1, user1Token, 3);

    const response = await request(app)
      .get("/v1/orders?limit=2&page=2")
      .set("Cookie", [`access_token=${user1Token}`]);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("limit", 2);
    expect(response.body).toHaveProperty("page", 2);
    expect(response.body.data.length).toBe(1);
  });

  it("deve retornar 401 sem autenticação", async () => {
    const response = await request(app).get("/v1/orders");
    expect(response.status).toBe(401);
  });
});
