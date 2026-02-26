const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { globalLimiter } = require("./config/rate-limit.config");

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));

const userRoutes = require("./modules/user/routes/user.routes");
const categoryRoutes = require("./modules/category/routes/category.routes");
const productRoutes = require("./modules/product/routes/product.routes");

app.use(express.json());
app.use(cookieParser());// Limite de Taxa Global
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
