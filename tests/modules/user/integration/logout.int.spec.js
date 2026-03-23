const request = require("supertest");
const app = require("../../../../src/app");

describe("User Route - POST /v1/user/logout", () => {
  it("deve limpar o cookie access_token e retornar 200", async () => {
    const response = await request(app)
      .post("/v1/user/logout")
      .set("Cookie", ["access_token=fake-token"]);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Logout realizado com sucesso");
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(response.headers["set-cookie"][0]).toMatch(/access_token=;/i);
  });
});
