const request = require("supertest");
const app = require("../../../../src/app");
const { sequelize, User, Product, Cart, CartItem } = require("../../../../src/models");
const { generateToken } = require("../../../../src/shared/auth/jwt");

describe("Cart Route - PUT /v1/cart/update/:itemId", () => {
  let userA;
  let userB;
  let tokenA;
  let tokenB;
  let product;

  beforeAll(async () => {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
    await sequelize.sync({ force: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });

    userA = await User.create({
      firstname: "User",
      surname: "A",
      cpf: "11111111101",
      phone: "11911111101",
      email: "usera@example.com",
      password: "password123",
      role: "USER",
      is_verified: true,
    });

    userB = await User.create({
      firstname: "User",
      surname: "B",
      cpf: "22222222202",
      phone: "11922222202",
      email: "userb@example.com",
      password: "password123",
      role: "USER",
      is_verified: true,
    });

    tokenA = generateToken({ sub: userA.id, role: userA.role });
    tokenB = generateToken({ sub: userB.id, role: userB.role });

    product = await Product.create({
      name: "Tenis Nike",
      slug: "tenis-nike",
      price: 200,
      price_with_discount: 150,
      enabled: true,
      stock: 10,
      description: "Tenis esportivo",
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

  it("deve atualizar a quantidade de um item", async () => {
    const addResponse = await request(app)
      .post("/v1/cart/add")
      .set("Cookie", `access_token=${tokenA}`)
      .send({ product_id: product.id, quantity: 1 });

    const itemId = addResponse.body.id;

    const response = await request(app)
      .put(`/v1/cart/update/${itemId}`)
      .set("Cookie", `access_token=${tokenA}`)
      .send({ quantity: 5 });

    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(5);
  });

  it("deve retornar 403 ao tentar atualizar item de outro usuario", async () => {
    const addResponse = await request(app)
      .post("/v1/cart/add")
      .set("Cookie", `access_token=${tokenA}`)
      .send({ product_id: product.id, quantity: 1 });

    const itemId = addResponse.body.id;

    const response = await request(app)
      .put(`/v1/cart/update/${itemId}`)
      .set("Cookie", `access_token=${tokenB}`)
      .send({ quantity: 10 });

    expect(response.status).toBe(403);
  });

  it("deve retornar 404 para itemId inexistente", async () => {
    const fakeUuid = "00000000-0000-0000-0000-000000000000";
    const response = await request(app)
      .put(`/v1/cart/update/${fakeUuid}`)
      .set("Cookie", `access_token=${tokenA}`)
      .send({ quantity: 5 });

    expect(response.status).toBe(404);
  });

  it("deve retornar 400 para itemId invalido", async () => {
    const response = await request(app)
      .put("/v1/cart/update/invalid-id")
      .set("Cookie", `access_token=${tokenA}`)
      .send({ quantity: 5 });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
});
