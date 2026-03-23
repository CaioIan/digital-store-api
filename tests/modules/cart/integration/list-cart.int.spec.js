const request = require("supertest");
const app = require("../../../../src/app");
const { sequelize, User, Product, Cart, CartItem, ProductImage } = require("../../../../src/models");
const { generateToken } = require("../../../../src/shared/auth/jwt");

describe("Cart Route - GET /v1/cart", () => {
  let user;
  let token;
  let product;

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

    product = await Product.create({
      name: "Tenis Nike",
      slug: "tenis-nike",
      price: 200,
      price_with_discount: 150,
      enabled: true,
      stock: 10,
      description: "Tenis esportivo",
    });

    await ProductImage.create({
      product_id: product.id,
      path: "https://example.com/tenis.jpg",
      enabled: true,
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

  it("deve retornar carrinho vazio quando nao ha itens", async () => {
    const response = await request(app)
      .get("/v1/cart")
      .set("Cookie", `access_token=${token}`);

    expect(response.status).toBe(200);
    expect(response.body.cart).toBeDefined();
    expect(response.body.cart.items).toEqual([]);
  });

  it("deve retornar itens com dados do produto populados", async () => {
    const cart = await Cart.create({ user_id: user.id });
    await CartItem.create({
      cart_id: cart.id,
      product_id: product.id,
      quantity: 2,
      selected_color: "Preto",
      selected_size: "42",
    });

    const response = await request(app)
      .get("/v1/cart")
      .set("Cookie", `access_token=${token}`);

    expect(response.status).toBe(200);
    expect(response.body.cart.items).toHaveLength(1);

    const item = response.body.cart.items[0];
    expect(item.quantity).toBe(2);
    expect(item.selected_color).toBe("Preto");
    expect(item.selected_size).toBe("42");
    expect(item.product).toBeDefined();
    expect(item.product.name).toBe("Tenis Nike");
    expect(item.product.price).toBe(200);
    expect(item.product.price_with_discount).toBe(150);
    expect(item.product.images).toBeDefined();
    expect(item.product.images).toHaveLength(1);
  });

  it("deve retornar 401 sem token", async () => {
    const response = await request(app).get("/v1/cart");
    expect(response.status).toBe(401);
  });
});
