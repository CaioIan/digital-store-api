const request = require("supertest");
const app = require("../../../../src/app");
const { sequelize, User, Product, Cart, CartItem } = require("../../../../src/models");
const { generateToken } = require("../../../../src/shared/auth/jwt");

describe("Cart Route - DELETE /v1/cart/clear", () => {
  let user;
  let token;
  let product1;
  let product2;

  beforeAll(async () => {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
    await sequelize.sync({ force: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });

    user = await User.create({
      firstname: "User",
      surname: "A",
      cpf: "11111111101",
      phone: "11911111101",
      email: "usera@example.com",
      password: "password123",
      role: "USER",
      is_verified: true,
    });

    token = generateToken({ sub: user.id, role: user.role });

    product1 = await Product.create({
      name: "Tenis Nike",
      slug: "tenis-nike",
      price: 200,
      price_with_discount: 150,
      enabled: true,
      stock: 10,
      description: "Tenis esportivo",
    });

    product2 = await Product.create({
      name: "Camiseta Adidas",
      slug: "camiseta-adidas",
      price: 100,
      price_with_discount: 80,
      enabled: true,
      stock: 5,
      description: "Camiseta esportiva",
    });
  });

  afterEach(async () => {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
    await CartItem.destroy({ where: {}, truncate: true, force: true });
    await Cart.destroy({ where: {}, truncate: true, force: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("deve limpar todos os itens do carrinho", async () => {
    await request(app)
      .post("/v1/cart/add")
      .set("Cookie", `access_token=${token}`)
      .send({ product_id: product1.id, quantity: 2 });

    await request(app)
      .post("/v1/cart/add")
      .set("Cookie", `access_token=${token}`)
      .send({ product_id: product2.id, quantity: 1 });

    const response = await request(app)
      .delete("/v1/cart/clear")
      .set("Cookie", `access_token=${token}`);

    expect(response.status).toBe(204);

    const listResponse = await request(app)
      .get("/v1/cart")
      .set("Cookie", `access_token=${token}`);

    expect(listResponse.body.cart.items).toHaveLength(0);
  });

  it("deve retornar 204 mesmo com carrinho vazio", async () => {
    const response = await request(app)
      .delete("/v1/cart/clear")
      .set("Cookie", `access_token=${token}`);

    expect(response.status).toBe(204);
  });

  it("deve retornar 401 sem token", async () => {
    const response = await request(app).delete("/v1/cart/clear");
    expect(response.status).toBe(401);
  });
});
