const express = require("express");
const asyncHandler = require("../../../shared/middlewares/async-handler.middleware");
const authVerificationMiddleware = require("../../../shared/auth/auth-verification.middleware");

const CreateOrderController = require("../http/controllers/create-order.controller");
const GetOrderByIdController = require("../http/controllers/get-order-by-id.controller");
const ListUserOrdersController = require("../http/controllers/list-user-orders.controller");
const AdminListOrdersController = require("../http/controllers/admin-list-orders.controller");
const UpdateOrderStatusController = require("../http/controllers/update-order-status.controller");

const roleGuardMiddleware = require("../../../shared/middlewares/role-guard.middleware");

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
 * Endpoint para Listar todos os Pedidos do Usuário Autenticado
 */
router.get(
  "/v1/orders",
  authVerificationMiddleware,
  asyncHandler(ListUserOrdersController.handle)
);

/**
 * Endpoint para Admin Listar todos os Pedidos de um usuário específico
 * Requer autenticação e permissão de ADMIN.
 */
router.get(
  "/v1/admin/orders",
  authVerificationMiddleware,
  roleGuardMiddleware.handle(["ADMIN"]),
  asyncHandler(AdminListOrdersController.handle)
);

/**
 * Endpoint para Admin atualizar o status de um pedido
 */
router.patch(
  "/v1/admin/orders/:id/status",
  authVerificationMiddleware,
  roleGuardMiddleware.handle(["ADMIN"]),
  asyncHandler(UpdateOrderStatusController.handle)
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
