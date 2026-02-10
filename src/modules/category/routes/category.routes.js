const { createCategoryValidator } = require("../http/validators/create-category.validator");
const CreateCategoryController = require("../http/controllers/create-category.controller");

const express = require("express");
const authVerificationMiddleware = require("../../../shared/auth/auth-verification.middleware");
const roleGuardMiddleware = require("../../../shared/middlewares/role-guard.middleware");
const SearchCategoryController = require("../http/controllers/search-category.controller");
const { searchCategoryValidator } = require("../http/validators/search-category.validator");
const GetCategoryByIdController = require("../http/controllers/get-category-by-id.controller");
const { getCategoryByIdValidator } = require("../http/validators/get-category-by-id.validator");
const router = express.Router();

router.post(
  "/v1/category",
  authVerificationMiddleware,
  roleGuardMiddleware.handle(["ADMIN"]),
  createCategoryValidator,
  CreateCategoryController.handle,
);

router.get("/v1/category/search", authVerificationMiddleware, searchCategoryValidator, SearchCategoryController.handle);
router.get("/v1/category/:id", authVerificationMiddleware, getCategoryByIdValidator, GetCategoryByIdController.handle);

module.exports = router;
