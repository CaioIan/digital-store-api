const request = require("supertest");
const app = require("../../../../src/app");
const { setupTestDatabase, clearTestDatabase, closeTestDatabase, createTestUser } = require("../../../helpers/test-database.helper");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const { Cart, CartItem, Product, Category } = require("../../../../src/models");

describe("Order Route - GET /v1/orders/:id", () => {
  let user1;
  let user2;
  let user1Token;
  let user2Token;
  let testProductId;

  const checkoutPayload = {
    personal_info: {
      full_name: "Francisco",
      cpf: "123.485.913-35",
      email: "f@test.com",
      phone: "8599999999",
    },
    delivery_address: {
      address: "Rua",
      neighborhood: "Centro",
      city: "Fortaleza",
      cep: "43368-000",
    },
    payment: {
      method: "boleto",
    },
  };

  async function createOrderForUser(userToken, quantity = 2) {
    const cart = await Cart.create({ user_id: user1.id });
    await CartItem.create({
      cart_id: cart.id,
      product_id: testProductId,
      quantity,
    });

    const createResponse = await request(app)
      .post("/v1/orders")
      .set("Cookie", [`access_token=${userToken}`])
      .send(checkoutPayload);

    expect(createResponse.status).toBe(201);
    return createResponse.body.order_id;
  }

  beforeAll(async () => {
    await setupTestDatabase();

    const category = await Category.create({ name: "Tenis Teste", slug: "tenis-teste" });
    const product = await Product.create({
      enabled: true,
      name: "Tenis Teste Order",
      slug: "tenis-teste-order",
      stock: 10,
      description: "Tenis Teste",
      price: 200,
      price_with_discount: 150,
      category_id: category.id,
    });

    testProductId = product.id;
  });

  beforeEach(async () => {
    await clearTestDatabase();

    user1 = await createTestUser({ email: "user1-orders-by-id@test.com" });
    user2 = await createTestUser({ email: "user2-orders-by-id@test.com" });

    user1Token = generateToken({ sub: user1.id, role: user1.role });
    user2Token = generateToken({ sub: user2.id, role: user2.role });
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("deve retornar nota fiscal espelho do pedido", async () => {
    const orderId = await createOrderForUser(user1Token, 2);

    const response = await request(app)
      .get(`/v1/orders/${orderId}`)
      .set("Cookie", [`access_token=${user1Token}`]);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", orderId);
    expect(response.body).toHaveProperty("status", "completed");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("personal_info");
    expect(response.body).toHaveProperty("delivery_address");
    expect(response.body).toHaveProperty("payment_info");
    expect(response.body).toHaveProperty("items");
    expect(response.body).toHaveProperty("summary");

    expect(response.body.summary.subtotal).toBe(300);
    expect(response.body.summary.total).toBe(300);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toHaveProperty("price_at_purchase", 150);
    expect(response.body.items[0]).toHaveProperty("quantity", 2);
  });

  it("deve retornar 404 quando outro usuario tenta acessar pedido", async () => {
    const orderId = await createOrderForUser(user1Token, 2);

    const response = await request(app)
      .get(`/v1/orders/${orderId}`)
      .set("Cookie", [`access_token=${user2Token}`]);

    expect(response.status).toBe(404);
  });

  it("deve retornar 400 para id invalido", async () => {
    const response = await request(app)
      .get("/v1/orders/invalid-id")
      .set("Cookie", [`access_token=${user1Token}`]);

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("deve retornar 401 sem autenticacao", async () => {
    const response = await request(app).get("/v1/orders/00000000-0000-0000-0000-000000000000");
    expect(response.status).toBe(401);
  });
});
