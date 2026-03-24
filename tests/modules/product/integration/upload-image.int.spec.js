jest.mock("multer", () => {
  const multer = () => ({
    single: () => (req, res, next) => next(),
    array: () => (req, res, next) => next(),
  });
  multer.memoryStorage = () => ({});
  return multer;
});

// Mock do Cloudinary (DEVE VIR ANTES DE TODAS AS IMPORTAÇÕES)
const mockUpload = jest.fn().mockResolvedValue({
  secure_url: "https://res.cloudinary.com/test-cloud/image/upload/v1234/products/test-image.jpg",
  public_id: "products/test-image",
});

jest.mock("../../../../src/config/cloudinary.config", () => ({
  uploader: {
    upload: mockUpload,
  },
}));

const request = require("supertest");
const express = require("express");
const { generateToken } = require("../../../../src/shared/auth/jwt");
const productRoutes = require("../../../../src/modules/product/routes/product.routes");

// Setup da aplicação Express para o teste
const app = express();
app.use(express.json());
app.use(productRoutes);
const errorHandler = require("../../../../src/shared/middlewares/error-handler.middleware");
app.use(errorHandler);

describe("Upload Image - Integration Tests", () => {
  const adminPayload = { sub: "admin-id", role: "ADMIN", email: "admin@test.com" };
  const userPayload = { sub: "user-id", role: "USER", email: "user@test.com" };

  beforeEach(() => {
    mockUpload.mockClear();
  });

  // ============ SUCESSO ============

  it("POST /v1/product/upload-image - Deve fazer upload com JSON base64 (ADMIN)", async () => {
    const token = generateToken(adminPayload);
    const payload = {
      type: "image/png",
      content: "iVBORw0KGgoAAAANSUhEUgAAAAUA",
    };

    const response = await request(app)
      .post("/v1/product/upload-image")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty("url");
    expect(response.body[0]).toHaveProperty("public_id");
    expect(response.body[0].url).toContain("cloudinary.com");
    expect(response.body[0].public_id).toBe("products/test-image");
  });

  // ============ AUTENTICAÇÃO / AUTORIZAÇÃO ============

  it("POST /v1/product/upload-image - Deve retornar 403 se o usuário não for ADMIN", async () => {
    const token = generateToken(userPayload);
    const payload = {
      type: "image/png",
      content: "iVBORw0KGgoAAAANSUhEUgAAAAUA",
    };

    const response = await request(app)
      .post("/v1/product/upload-image")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");
  });

  it("POST /v1/product/upload-image - Deve retornar 401 se não enviar token", async () => {
    const payload = {
      type: "image/png",
      content: "iVBORw0KGgoAAAANSUhEUgAAAAUA",
    };

    const response = await request(app).post("/v1/product/upload-image").send(payload);

    expect(response.status).toBe(401);
  });

  // ============ VALIDAÇÃO DE CAMPOS ============

  it("POST /v1/product/upload-image - Deve retornar 400 se faltar campo 'type'", async () => {
    const token = generateToken(adminPayload);
    const payload = {
      content: "iVBORw0KGgoAAAANSUhEUgAAAAUA",
    };

    const response = await request(app)
      .post("/v1/product/upload-image")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: "type" })]));
  });

  it("POST /v1/product/upload-image - Deve retornar 400 se faltar campo 'content'", async () => {
    const token = generateToken(adminPayload);
    const payload = {
      type: "image/png",
    };

    const response = await request(app)
      .post("/v1/product/upload-image")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: "content" })]));
  });

  it("POST /v1/product/upload-image - Deve retornar 400 se 'type' não for image/*", async () => {
    const token = generateToken(adminPayload);
    const payload = {
      type: "application/pdf",
      content: "iVBORw0KGgoAAAANSUhEUgAAAAUA",
    };

    const response = await request(app)
      .post("/v1/product/upload-image")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "type",
          message: expect.stringContaining("image"),
        }),
      ]),
    );
  });

  it("POST /v1/product/upload-image - Deve retornar 400 se 'content' estiver vazio", async () => {
    const token = generateToken(adminPayload);
    const payload = {
      type: "image/png",
      content: "",
    };

    const response = await request(app)
      .post("/v1/product/upload-image")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "content",
          message: expect.stringContaining("vazio"),
        }),
      ]),
    );
  });

  it("POST /v1/product/upload-image - Deve retornar 400 se não enviar nem arquivo nem JSON", async () => {
    const token = generateToken(adminPayload);

    const response = await request(app)
      .post("/v1/product/upload-image")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors"); // Validator retorna 'errors' array
  });
});
