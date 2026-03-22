const express = require("express");
const authVerificationMiddleware = require("../../../shared/auth/auth-verification.middleware");
const asyncHandler = require("../../../shared/middlewares/async-handler.middleware");
const ListCartController = require("../http/controllers/list-cart.controller");
const AddToCartController = require("../http/controllers/add-to-cart.controller");
const UpdateCartItemController = require("../http/controllers/update-cart-item.controller");
const RemoveCartItemController = require("../http/controllers/remove-cart-item.controller");
const ClearCartController = require("../http/controllers/clear-cart.controller");
const { addToCartValidator } = require("../http/validators/add-to-cart.validator");
const { updateCartItemValidator } = require("../http/validators/update-cart-item.validator");
const { removeCartItemValidator } = require("../http/validators/remove-cart-item.validator");

/**
 * Router Express para o módulo de carrinho.
 * Define todas as rotas do recurso /v1/cart com seus middlewares.
 * Todas as rotas são protegidas por autenticação JWT.
 *
 * Rotas:
 * - GET    /v1/cart               → Lista os itens do carrinho (autenticado)
 * - POST   /v1/cart/add           → Adiciona um produto ao carrinho (autenticado)
 * - PUT    /v1/cart/update/:itemId → Atualiza a quantidade de um item (autenticado)
 * - DELETE /v1/cart/remove/:itemId → Remove um item do carrinho (autenticado)
 * - DELETE /v1/cart/clear          → Limpa todo o carrinho (autenticado)
 */
const router = express.Router();

// =========================
// Rotas Protegidas
// =========================
router.get(
  "/v1/cart",
  authVerificationMiddleware,
  asyncHandler(ListCartController.handle),
);

router.post(
  "/v1/cart/add",
  authVerificationMiddleware,
  addToCartValidator,
  asyncHandler(AddToCartController.handle),
);

router.put(
  "/v1/cart/update/:itemId",
  authVerificationMiddleware,
  updateCartItemValidator,
  asyncHandler(UpdateCartItemController.handle),
);

router.delete(
  "/v1/cart/remove/:itemId",
  authVerificationMiddleware,
  removeCartItemValidator,
  asyncHandler(RemoveCartItemController.handle),
);

router.delete(
  "/v1/cart/clear",
  authVerificationMiddleware,
  asyncHandler(ClearCartController.handle),
);

module.exports = router;
