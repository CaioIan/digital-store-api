const express = require("express");
const createUserController = require("../http/controllers/create-user.controller");
const GetUserByIdController = require("../http/controllers/get-user-by-id.controller");
const LoginController = require("../http/controllers/login.controller");
const UpdateUserController = require("../http/controllers/update-user.controller");
const DeleteUserController = require("../http/controllers/delete-user.controller");
const { createUserValidator } = require("../http/validators/create-user.validator");

const authVerificationMiddleware = require("../../../shared/auth/auth-verification.middleware");
const { loginValidator } = require("../http/validators/login.validator");
const { updateUserValidator } = require("../http/validators/update-user.validator");
const asyncHandler = require("../../../shared/middlewares/async-handler.middleware");
const { authLimiter, createAccountLimiter } = require("../../../config/rate-limit.config");

/**
 * Router Express para o módulo de usuários.
 * Define todas as rotas do recurso /v1/user com seus middlewares.
 *
 * Rotas públicas:
 * - POST /v1/user/login → Autenticação (loginValidator → LoginController)
 * - POST /v1/user       → Cadastro (createUserValidator → CreateUserController)
 *
 * Rotas autenticadas (requerem Bearer Token JWT):
 * - GET    /v1/user/:id → Busca por ID (authVerification → GetUserByIdController)
 * - PATCH  /v1/user/:id → Atualização de perfil (authVerification → updateUserValidator → UpdateUserController)
 * - DELETE /v1/user/:id → Exclusão de conta (authVerification → DeleteUserController)
 */
const router = express.Router();

router.post("/v1/user/login", authLimiter, loginValidator, asyncHandler(LoginController.handle));
router.post("/v1/user", createAccountLimiter, createUserValidator, asyncHandler(createUserController.handle));
router.get("/v1/user/:id", authVerificationMiddleware, asyncHandler(GetUserByIdController.handle));
router.patch(
  "/v1/user/:id",
  authVerificationMiddleware,
  updateUserValidator,
  asyncHandler(UpdateUserController.handle),
);
router.delete("/v1/user/:id", authVerificationMiddleware, asyncHandler(DeleteUserController.handle));

module.exports = router;
