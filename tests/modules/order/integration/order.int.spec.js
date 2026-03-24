const request = require("supertest");
const app = require("../../../../src/app");
const { setupTestDatabase, clearTestDatabase, closeTestDatabase, createTestUser } = require("../../../helpers/test-database.helper");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const { Order, Cart, CartItem, Product, Category, sequelize } = require("../../../../src/models");

describe("Order Module Integration Tests", () => {
  let user1Token;
  let user2Token;
  let user1;
  let user2;
  let testProductId;

  beforeAll(async () => {
    await setupTestDatabase();

    // Criação dos produtos para teste
    const category = await Category.create({ name: "Tenis Teste", slug: "tenis-teste" });
    const product = await Product.create({
      enabled: true,
      name: "Tenis Teste Order",
      slug: "tenis-teste-order",
      stock: 10,
      description: "Tenis Teste",
      price: 200.0,
      price_with_discount: 150.0,
      category_id: category.id,
    });
    testProductId = product.id;
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();

    // Arrange para a maioria dos testes: Usuários, Tokens, Carrinhos
    user1 = await createTestUser();
    user2 = await createTestUser();

    user1Token = generateToken({ sub: user1.id, role: user1.role });
    user2Token = generateToken({ sub: user2.id, role: user2.role });

    // Popular carrinho do usuário 1
    const cart = await Cart.create({ user_id: user1.id });
    await CartItem.create({
      cart_id: cart.id,
      product_id: testProductId,
      quantity: 2,
    });
  });

  describe("POST /v1/orders - Criar Pedido (Checkout)", () => {
    const validPayload = {
      personal_info: {
        full_name: "Francisco Antonio Pereira",
        cpf: "123.485.913-35",
        email: "francisco@gmail.com",
        phone: "(85) 5555-5555",
      },
      delivery_address: {
        address: "Rua João Pessoa, 333",
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

    it("deve criar um pedido com sucesso, esvaziar o carrinho e retornar o order_id", async () => {
      const response = await request(app)
        .post("/v1/orders")
        .set("Cookie", [`access_token=${user1Token}`])
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message", "Pedido criado com sucesso");
      expect(response.body).toHaveProperty("order_id");

      // Verify db order content
      const savedOrder = await Order.findByPk(response.body.order_id);
      expect(savedOrder).not.toBeNull();
      // Total price check: 2 items * 150 discount price = 300
      expect(parseFloat(savedOrder.total)).toBe(300);

      // Verify masking
      expect(savedOrder.payment_info.last_digits).toBe("3456");
      expect(savedOrder.payment_info.card_number).toBeUndefined(); // Should not exist

      // Verify cart deletion
      const user1Cart = await Cart.findOne({ where: { user_id: user1.id } });
      expect(user1Cart).toBeNull();
    });

    it("deve rejeitar checkout com erro 400 se o carrinho estiver vazio", async () => {
      // User 2 tem carrinho vazio
      const response = await request(app)
        .post("/v1/orders")
        .set("Cookie", [`access_token=${user2Token}`])
        .send(validPayload);

      expect(response.status).toBe(400); // Bad Request via error handler
      // Nossa AppError retorna status 400 com "Carrinho está vazio." ou no corpo como error
    });

    it("deve validar payload estrutural de checkout (zod)", async () => {
      const invalidPayload = {
        personal_info: {}, // missing required
        delivery_address: {}, // missing required
        payment: { method: "invalid-method" },
      };

      const response = await request(app)
        .post("/v1/orders")
        .set("Cookie", [`access_token=${user1Token}`])
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("GET /v1/orders/:id - Detalhes do Pedido", () => {
    let orderId;

    beforeEach(async () => {
      // Setup order up manually ou via endpoint first
      const validPayload = {
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

      const createResponse = await request(app)
        .post("/v1/orders")
        .set("Cookie", [`access_token=${user1Token}`])
        .send(validPayload);

      orderId = createResponse.body.order_id;
    });

    it("deve retornar a estrutura de espelho de nota fiscal exatamente como especificado no Contrato Frontend", async () => {
      const response = await request(app)
        .get(`/v1/orders/${orderId}`)
        .set("Cookie", [`access_token=${user1Token}`]);

      expect(response.status).toBe(200);

      // Verificação root level keys
      expect(response.body).toHaveProperty("id", orderId);
      expect(response.body).toHaveProperty("status", "completed");
      expect(response.body).toHaveProperty("created_at");
      expect(response.body).toHaveProperty("personal_info");
      expect(response.body).toHaveProperty("delivery_address");
      expect(response.body).toHaveProperty("payment_info");
      expect(response.body).toHaveProperty("items");
      expect(response.body).toHaveProperty("summary");

      // Verificação summary logic
      expect(response.body.summary.subtotal).toBe(300);
      expect(response.body.summary.total).toBe(300);

      // Verificação itens
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toHaveProperty("price_at_purchase", 150);
      expect(response.body.items[0]).toHaveProperty("quantity", 2);
    });

    it("deve bloquear acesso (retornar 403/404) quando um usuário tenta acessar um pedido que não é dele", async () => {
      const response = await request(app)
        .get(`/v1/orders/${orderId}`)
        .set("Cookie", [`access_token=${user2Token}`]);

      expect(response.status).toBe(404); // GetOrderByIdService retorna 404 por padrao pra n vazar info se ele existe
    });
  });
});
