const { createCategoryValidator } = require("../http/validators/create-category.validator");
const CreateCategoryController = require("../http/controllers/create-category.controller");

const express = require("express");
const authVerificationMiddleware = require("../../../shared/auth/auth-verification.middleware");
const roleGuardMiddleware = require("../../../shared/middlewares/role-guard.middleware");
const SearchCategoryController = require("../http/controllers/search-category.controller");
const { searchCategoryValidator } = require("../http/validators/search-category.validator");
const GetCategoryByIdController = require("../http/controllers/get-category-by-id.controller");
const { getCategoryByIdValidator } = require("../http/validators/get-category-by-id.validator");
const updateCategoryController = require("../http/controllers/update-category.controller");
const { updateCategoryValidator } = require("../http/validators/update-category.validator");
const deleteCategoryController = require("../http/controllers/delete-category.controller");
const { deleteCategoryValidator } = require("../http/validators/delete-category.validator");
const asyncHandler = require("../../../shared/middlewares/async-handler.middleware");

/**
 * Router Express para o módulo de categorias.
 * Define todas as rotas do recurso /v1/category com seus middlewares.
 *
 * Rotas:
 * - POST   /v1/category        → Cria uma nova categoria (ADMIN)
 * - PATCH  /v1/category/:id    → Atualiza uma categoria (ADMIN)
 * - DELETE /v1/category/:id    → Soft delete de uma categoria (ADMIN)
 * - GET    /v1/category/search → Busca paginada de categorias
 * - GET    /v1/category/:id    → Busca uma categoria pelo ID
 */
const router = express.Router();

// =========================
// Rotas de ADMIN (Protegidas)
// =========================
router.post(
  "/v1/category",
  authVerificationMiddleware,
  roleGuardMiddleware.handle(["ADMIN"]),
  createCategoryValidator,
  asyncHandler(CreateCategoryController.handle),
);

router.patch(
  "/v1/category/:id",
  authVerificationMiddleware,
  roleGuardMiddleware.handle(["ADMIN"]),
  updateCategoryValidator,
  asyncHandler(updateCategoryController.handle),
);
router.delete(
  "/v1/category/:id",
  authVerificationMiddleware,
  roleGuardMiddleware.handle(["ADMIN"]),
  deleteCategoryValidator,
  asyncHandler(deleteCategoryController.handle),
);

// =========================
// Rotas Protegidas
// =========================
router.get(
  "/v1/category/search",
  authVerificationMiddleware,
  searchCategoryValidator,
  asyncHandler(SearchCategoryController.handle),
);
router.get(
  "/v1/category/:id",
  authVerificationMiddleware,
  getCategoryByIdValidator,
  asyncHandler(GetCategoryByIdController.handle),
);

module.exports = router;
