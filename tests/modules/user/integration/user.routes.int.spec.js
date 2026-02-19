const request = require("supertest");
const express = require("express");
const routes = require("../../../../src/modules/user/routes/user.routes");
const { setupTestDatabase, sequelize, createTestUser } = require("../../../helpers/test-database.helper");
const { generateToken } = require("../../../../src/shared/auth/jwt");

const app = express();
app.use(express.json());
app.use(routes);

describe("User Routes - Character Limits Integration Tests", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  const longString50 = "a".repeat(51);
  const longString100 = "a".repeat(101);

  describe("POST /v1/user", () => {
    it("Deve retornar 400 se firstname, surname ou password excederem limites de caracteres", async () => {
      const invalidData = {
        firstname: longString50,
        surname: longString50,
        email: "valid@email.com",
        password: longString100,
        confirmPassword: longString100
      };

      const response = await request(app).post("/v1/user").send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
      const errors = response.body.errors;
      
      // Valida mensagens específicas do Zod
      expect(errors.some(e => e.message.includes("50 characters"))).toBe(true); // Firstname/Surname
      expect(errors.some(e => e.message.includes("100 characters"))).toBe(true); // Password
    });
  });

  describe("PATCH /v1/user/:id", () => {
    it("Deve retornar 400 se firstname ou surname excederem limite de 50 caracteres na atualização", async () => {
       const user = await createTestUser({ email: "update-limits@test.com" });
       const token = generateToken({ sub: user.id, role: "USER" });

       const invalidData = {
         firstname: longString50,
         surname: longString50
       };

       const response = await request(app)
         .patch(`/v1/user/${user.id}`)
         .set("Authorization", `Bearer ${token}`)
         .send(invalidData);

       expect(response.status).toBe(400);
       expect(response.body).toHaveProperty("errors");
       
       const errors = response.body.errors;
       // Valida se capturou o erro de limite
       // Zod default message for max usually contains the limit
       // Mas no update-user.validator.js não tem mensagem customizada no .max(50), 
       // então o Zod retorna algo como "String must contain at most 50 character(s)"
       // Vamos verificar genericamente ou se tiver mensagem customizada
       // Olhando o arquivo update-user.validator.js: field: z.string().min(2).max(50).optional()
       // Mensagem padrão do Zod
       expect(JSON.stringify(errors)).toMatch(/50/);
    });
  });
});
