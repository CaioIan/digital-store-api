const request = require("supertest");
const app = require("../../../../src/app");
const { sequelize, User, Product, Cart, CartItem } = require("../../../../src/models");
const { generateToken } = require("../../../../src/shared/auth/jwt");

describe("Cart Route - POST /v1/cart/add", () => {
  let user;
  let token;
  let product;
  let disabledProduct;

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

    disabledProduct = await Product.create({
      name: "Produto Desabilitado",
      slug: "produto-desabilitado",
      price: 50,
      price_with_discount: 40,
      enabled: false,
      stock: 0,
      description: "Produto inativo",
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

  it("deve adicionar um produto ao carrinho", async () => {
    const response = await request(app)
      .post("/v1/cart/add")
      .set("Cookie", `access_token=${token}`)
      .send({
        product_id: product.id,
        quantity: 1,
        selected_color: "Azul",
        selected_size: "42",
      });

    expect(response.status).toBe(201);
    expect(response.body.product_id).toBe(product.id);
    expect(response.body.quantity).toBe(1);
    expect(response.body.selected_color).toBe("Azul");
  });

  it("deve somar a quantidade quando o mesmo item ja existe", async () => {
    await request(app)
      .post("/v1/cart/add")
      .set("Cookie", `access_token=${token}`)
      .send({
        product_id: product.id,
        quantity: 2,
        selected_color: "Azul",
        selected_size: "42",
      });

    const response = await request(app)
      .post("/v1/cart/add")
      .set("Cookie", `access_token=${token}`)
      .send({
        product_id: product.id,
        quantity: 3,
        selected_color: "Azul",
        selected_size: "42",
      });

    expect(response.status).toBe(201);
    expect(response.body.quantity).toBe(5);
  });

  it("deve criar novo item quando cor e tamanho forem diferentes", async () => {
    await request(app)
      .post("/v1/cart/add")
      .set("Cookie", `access_token=${token}`)
      .send({
        product_id: product.id,
        quantity: 1,
        selected_color: "Azul",
        selected_size: "42",
      });

    await request(app)
      .post("/v1/cart/add")
      .set("Cookie", `access_token=${token}`)
      .send({
        product_id: product.id,
        quantity: 1,
        selected_color: "Preto",
        selected_size: "44",
      });

    const listResponse = await request(app)
      .get("/v1/cart")
      .set("Cookie", `access_token=${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.cart.items).toHaveLength(2);
  });

  it("deve rejeitar product_id inexistente", async () => {
    const response = await request(app)
      .post("/v1/cart/add")
      .set("Cookie", `access_token=${token}`)
      .send({ product_id: 99999, quantity: 1 });

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/produto.*n[aã]o.*encontrado/i);
  });

  it("deve rejeitar produto desabilitado", async () => {
    const response = await request(app)
      .post("/v1/cart/add")
      .set("Cookie", `access_token=${token}`)
      .send({ product_id: disabledProduct.id, quantity: 1 });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/produto.*n[aã]o.*dispon[ií]vel/i);
  });

  it("deve retornar 400 com body invalido", async () => {
    const response = await request(app)
      .post("/v1/cart/add")
      .set("Cookie", `access_token=${token}`)
      .send({ quantity: 1 });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("deve retornar 401 sem token", async () => {
    const response = await request(app)
      .post("/v1/cart/add")
      .send({ product_id: product.id, quantity: 1 });

    expect(response.status).toBe(401);
  });
});
