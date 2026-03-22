const express = require("express");
const CreateProductController = require("../http/controllers/create-product.controller");
const UploadImageController = require("../http/controllers/upload-image.controller");
const authVerificationMiddleware = require("../../../shared/auth/auth-verification.middleware");
const roleGuardMiddleware = require("../../../shared/middlewares/role-guard.middleware");
const { upload } = require("../../../shared/middlewares/upload.middleware");
const { createProductValidator } = require("../http/validators/create-product.validator");
const { uploadImageValidator } = require("../http/validators/upload-image.validator");
const { searchProductValidator } = require("../http/validators/search-product.validator");
const SearchProductController = require("../http/controllers/search-product.controller");
const GetProductByIdController = require("../http/controllers/get-product-by-id.controller");
const UpdateProductController = require("../http/controllers/update-product.controller");
const { getProductByIdValidator } = require("../http/validators/get-product-by-id.validator");
const { updateProductValidator } = require("../http/validators/update-product.validator");
const { deleteProductValidator } = require("../http/validators/delete-product.validator");
const DeleteProductController = require("../http/controllers/delete-product.controller");
const asyncHandler = require("../../../shared/middlewares/async-handler.middleware");

/**
 * Router Express para o módulo de produtos.
 * Define todas as rotas do recurso /v1/product com seus middlewares.
 *
 * Rotas:
 * - POST   /v1/product              → Cria um novo produto (ADMIN)
 * - POST   /v1/product/upload-image → Upload de imagem para Cloudinary (ADMIN)
 * - GET    /v1/product/search       → Busca paginada de produtos (público)
 * - GET    /v1/product/:id          → Busca um produto pelo ID (público)
 * - PATCH  /v1/product/:id          → Atualiza um produto (ADMIN)
 * - DELETE /v1/product/:id          → Remove um produto (ADMIN)
 */
const router = express.Router();

// =========================
// Rotas de ADMIN (Protegidas)
// =========================
router.post(
  "/v1/product",
  authVerificationMiddleware,
  roleGuardMiddleware.handle(["ADMIN"]),
  createProductValidator,
  asyncHandler(CreateProductController.handle),
);
router.post(
  "/v1/product/upload-image",
  authVerificationMiddleware,
  roleGuardMiddleware.handle(["ADMIN"]),
  upload.array("images", 10),
  uploadImageValidator,
  asyncHandler(UploadImageController.handle),
);
router.patch(
  "/v1/product/:id",
  authVerificationMiddleware,
  roleGuardMiddleware.handle(["ADMIN"]),
  updateProductValidator,
  asyncHandler(UpdateProductController.handle),
);
router.delete(
  "/v1/product/:id",
  authVerificationMiddleware,
  roleGuardMiddleware.handle(["ADMIN"]),
  deleteProductValidator,
  asyncHandler(DeleteProductController.handle),
);

// =========================
// Rotas Públicas
// =========================
router.get("/v1/product/search", searchProductValidator, asyncHandler(SearchProductController.handle));
router.get("/v1/product/:id", getProductByIdValidator, asyncHandler(GetProductByIdController.handle));

module.exports = router;
