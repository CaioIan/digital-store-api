const request = require("supertest");
const app = require("../../../../src/app");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const { sequelize, Category, Product, Cart, CartItem, Order } = require("../../../../src/models");
const { createTestUser, createTestAdmin } = require("../../../helpers/test-database.helper");

describe("Order Route - PATCH /v1/admin/orders/:id/status", () => {
  let admin;
  let user;
  let adminToken;
  let userToken;
  let product;

  const checkoutPayload = {
    personal_info: {
      full_name: "Cliente Status",
      cpf: "123.485.913-35",
      email: "status@test.com",
      phone: "85999999999",
    },
    delivery_address: {
      address: "Rua Status",
      neighborhood: "Centro",
      city: "Fortaleza",
      cep: "60000-000",
      complement: "Casa",
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

  async function createOrderForUser() {
    const cart = await Cart.create({ user_id: user.id });
    await CartItem.create({
      cart_id: cart.id,
      product_id: product.id,
      quantity: 1,
    });

    const response = await request(app)
      .post("/v1/orders")
      .set("Cookie", [`access_token=${userToken}`])
      .send(checkoutPayload);

    expect(response.status).toBe(201);
    return response.body.order_id;
  }

  beforeAll(async () => {
    await resetDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();

    admin = await createTestAdmin({ email: "admin-status@test.com" });
    user = await createTestUser({ email: "user-status@test.com" });

    adminToken = generateToken({ sub: admin.id, role: admin.role });
    userToken = generateToken({ sub: user.id, role: user.role });

    const category = await Category.create({ name: "Categoria Status", slug: "categoria-status", use_in_menu: true });
    product = await Product.create({
      enabled: true,
      name: "Produto Status",
      slug: "produto-status",
      stock: 100,
      description: "Produto para testes de status",
      price: 90,
      price_with_discount: 70,
      category_id: category.id,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("ADMIN deve atualizar status do pedido com sucesso", async () => {
    const orderId = await createOrderForUser();

    const response = await request(app)
      .patch(`/v1/admin/orders/${orderId}/status`)
      .set("Cookie", [`access_token=${adminToken}`])
      .send({ status: "shipped" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Status do pedido atualizado com sucesso.");
    expect(response.body.data).toHaveProperty("id", orderId);
    expect(response.body.data).toHaveProperty("status", "shipped");

    const updatedOrder = await Order.findByPk(orderId);
    expect(updatedOrder.status).toBe("shipped");
  });

  it("deve retornar 400 para status inválido", async () => {
    const orderId = await createOrderForUser();

    const response = await request(app)
      .patch(`/v1/admin/orders/${orderId}/status`)
      .set("Cookie", [`access_token=${adminToken}`])
      .send({ status: "invalid-status" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 404 para pedido inexistente", async () => {
    const response = await request(app)
      .patch("/v1/admin/orders/00000000-0000-0000-0000-000000000099/status")
      .set("Cookie", [`access_token=${adminToken}`])
      .send({ status: "shipped" });

    expect(response.status).toBe(404);
  });

  it("USER deve receber 403 ao tentar atualizar status", async () => {
    const orderId = await createOrderForUser();

    const response = await request(app)
      .patch(`/v1/admin/orders/${orderId}/status`)
      .set("Cookie", [`access_token=${userToken}`])
      .send({ status: "delivered" });

    expect(response.status).toBe(403);
  });

  it("deve retornar 401 sem autenticação", async () => {
    const orderId = await createOrderForUser();

    const response = await request(app)
      .patch(`/v1/admin/orders/${orderId}/status`)
      .send({ status: "shipped" });

    expect(response.status).toBe(401);
  });
});
