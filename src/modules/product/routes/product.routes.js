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
const UpdateProductController = require("../http/controllers/update-product.controller")
const { getProductByIdValidator } = require("../http/validators/get-product-by-id.validator");
const { updateProductValidator } = require("../http/validators/update-product.validator");
const { deleteProductValidator } = require("../http/validators/delete-product.validator"); // Add import
const DeleteProductController = require("../http/controllers/delete-product.controller"); // Add import

const router = express.Router();


router.post("/v1/product", authVerificationMiddleware, roleGuardMiddleware.handle(["ADMIN"]), createProductValidator, CreateProductController.handle);
router.post("/v1/product/upload-image", authVerificationMiddleware, roleGuardMiddleware.handle(["ADMIN"]), upload.single("image"), uploadImageValidator, UploadImageController.handle);
router.get("/v1/product/search", searchProductValidator, SearchProductController.handle)
router.get("/v1/product/:id", getProductByIdValidator, GetProductByIdController.handle)
router.patch("/v1/product/:id", authVerificationMiddleware, roleGuardMiddleware.handle(["ADMIN"]), updateProductValidator, UpdateProductController.handle)
router.delete("/v1/product/:id", authVerificationMiddleware, roleGuardMiddleware.handle(["ADMIN"]), deleteProductValidator, DeleteProductController.handle); // Add route

module.exports = router;