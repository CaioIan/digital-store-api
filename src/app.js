const express = require("express");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

const userRoutes = require("./modules/user/routes/user.routes");

app.use(express.json());

// Rota da documentação Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("", userRoutes);

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

module.exports = app;
