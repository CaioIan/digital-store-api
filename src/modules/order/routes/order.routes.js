const express = require("express");
const asyncHandler = require("../../../shared/middlewares/async-handler.middleware");
const authVerificationMiddleware = require("../../../shared/auth/auth-verification.middleware");

const CreateOrderController = require("../http/controllers/create-order.controller");
const GetOrderByIdController = require("../http/controllers/get-order-by-id.controller");

const { createOrderValidator } = require("../http/validators/create-order.validator");
const { getOrderByIdValidator } = require("../http/validators/get-order-by-id.validator");

const router = express.Router();

/**
 * Endpoint para Finalizar Checkout e Criar um Pedido (Conversão de Carrinho)
 */
router.post(
  "/v1/orders",
  authVerificationMiddleware,
  createOrderValidator,
  asyncHandler(CreateOrderController.handle)
);

/**
 * Endpoint para Visualizar a Nota Fiscal Imutável de um Pedido
 */
router.get(
  "/v1/orders/:id",
  authVerificationMiddleware,
  getOrderByIdValidator,
  asyncHandler(GetOrderByIdController.handle)
);

module.exports = router;
