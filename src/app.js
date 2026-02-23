const express = require("express");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { globalLimiter } = require("./config/rate-limit.config");

const app = express();

const userRoutes = require("./modules/user/routes/user.routes");
const categoryRoutes = require("./modules/category/routes/category.routes");
const productRoutes = require("./modules/product/routes/product.routes");

app.use(express.json());

// Limite de Taxa Global
app.use(globalLimiter);

// Rota da documentação Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(userRoutes);
app.use(categoryRoutes);
app.use(productRoutes);

const errorHandler = require("./shared/middlewares/error-handler.middleware");
app.use(errorHandler);

app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

module.exports = app;
