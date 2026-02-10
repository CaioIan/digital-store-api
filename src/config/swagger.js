const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Digital Store API",
    version: "1.0.0",
    description: "Documentação da API Digital Store",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./src/modules/**/*.js"], // Caminho para os arquivos de rotas/controllers
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
