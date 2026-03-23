const request = require("supertest");
const app = require("../../../../src/app");
const { setupTestDatabase, clearTestDatabase, closeTestDatabase, createTestUser } = require("../../../helpers/test-database.helper");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const { Order, Cart, CartItem, Product, Category } = require("../../../../src/models");

describe("Order Route - POST /v1/orders", () => {
  let user1;
  let user2;
  let user1Token;
  let user2Token;
  let testProductId;

  const validPayload = {
    personal_info: {
      full_name: "Francisco Antonio Pereira",
      cpf: "123.485.913-35",
      email: "francisco@gmail.com",
      phone: "(85) 5555-5555",
    },
    delivery_address: {
      address: "Rua Joao Pessoa, 333",
      neighborhood: "Centro",
      city: "Fortaleza",
      cep: "43368-000",
      complement: "Apto 101",
    },
    payment: {
      method: "credit-card",
      installments: 10,
      card_holder: "FRANCISCO A P",
      card_number: "1234567890123456",
      card_expiry: "12/29",
      card_cvv: "123",
    },
  };

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

    user1 = await createTestUser();
    user2 = await createTestUser();

    user1Token = generateToken({ sub: user1.id, role: user1.role });
    user2Token = generateToken({ sub: user2.id, role: user2.role });

    const cart = await Cart.create({ user_id: user1.id });
    await CartItem.create({
      cart_id: cart.id,
      product_id: testProductId,
      quantity: 2,
    });
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("deve criar pedido, esvaziar carrinho e retornar order_id", async () => {
    const response = await request(app)
      .post("/v1/orders")
      .set("Cookie", [`access_token=${user1Token}`])
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message", "Pedido criado com sucesso");
    expect(response.body).toHaveProperty("order_id");

    const savedOrder = await Order.findByPk(response.body.order_id);
    expect(savedOrder).not.toBeNull();
    expect(parseFloat(savedOrder.total)).toBe(300);
    expect(savedOrder.payment_info.last_digits).toBe("3456");
    expect(savedOrder.payment_info.card_number).toBeUndefined();

    const user1Cart = await Cart.findOne({ where: { user_id: user1.id } });
    expect(user1Cart).toBeNull();
  });

  it("deve retornar 400 quando carrinho estiver vazio", async () => {
    const response = await request(app)
      .post("/v1/orders")
      .set("Cookie", [`access_token=${user2Token}`])
      .send(validPayload);

    expect(response.status).toBe(400);
  });

  it("deve retornar 400 para payload invalido", async () => {
    const invalidPayload = {
      personal_info: {},
      delivery_address: {},
      payment: { method: "invalid-method" },
    };

    const response = await request(app)
      .post("/v1/orders")
      .set("Cookie", [`access_token=${user1Token}`])
      .send(invalidPayload);

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("deve retornar 401 sem autenticacao", async () => {
    const response = await request(app)
      .post("/v1/orders")
      .send(validPayload);

    expect(response.status).toBe(401);
  });
});
