const express = require("express");
const createUserController = require("../http/controllers/create-user.controller");
const GetUserByIdController = require("../http/controllers/get-user-by-id.controller");
const GetUserProfileController = require("../http/controllers/get-user-profile.controller");
const LoginController = require("../http/controllers/login.controller");
const UpdateUserController = require("../http/controllers/update-user.controller");
const UpdateUserAddressController = require("../http/controllers/update-user-address.controller");
const DeleteUserController = require("../http/controllers/delete-user.controller");
const LogoutController = require("../http/controllers/logout.controller");
const AdminListUsersController = require("../http/controllers/admin-list-users.controller");
const { createUserValidator } = require("../http/validators/create-user.validator");

const authVerificationMiddleware = require("../../../shared/auth/auth-verification.middleware");
const { loginValidator } = require("../http/validators/login.validator");
const { updateUserValidator } = require("../http/validators/update-user.validator");
const { updateUserAddressValidator } = require("../http/validators/update-user-address.validator");
const asyncHandler = require("../../../shared/middlewares/async-handler.middleware");
const roleGuardMiddleware = require("../../../shared/middlewares/role-guard.middleware");
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
 * - GET    /v1/user/profile → Busca perfil completo com endereço
 * - PUT    /v1/user/address → Atualiza endereço de entrega
 * - GET    /v1/user/:id → Busca por ID (authVerification → GetUserByIdController)
 * - PATCH  /v1/user/:id → Atualização de perfil (authVerification → updateUserValidator → UpdateUserController)
 * - DELETE /v1/user/:id → Exclusão de conta (authVerification → DeleteUserController)
 */
const router = express.Router();

router.post("/v1/user/login", authLimiter, loginValidator, asyncHandler(LoginController.handle));
router.post("/v1/user/logout", asyncHandler(LogoutController.handle));
router.post("/v1/user", createAccountLimiter, createUserValidator, asyncHandler(createUserController.handle));

/**
 * Rota exclusiva para Admin: Listar todos os usuários paginados.
 */
router.get(
  "/v1/admin/users",
  authVerificationMiddleware,
  roleGuardMiddleware.handle(["ADMIN"]),
  asyncHandler(AdminListUsersController.handle),
);

// Rotas específicas ANTES das rotas com :id para evitar conflito
router.get("/v1/user/profile", authVerificationMiddleware, asyncHandler(GetUserProfileController.handle));
router.put(
  "/v1/user/address",
  authVerificationMiddleware,
  updateUserAddressValidator,
  asyncHandler(UpdateUserAddressController.handle),
);

router.get("/v1/user/:id", authVerificationMiddleware, asyncHandler(GetUserByIdController.handle));
router.patch(
  "/v1/user/:id",
  authVerificationMiddleware,
  updateUserValidator,
  asyncHandler(UpdateUserController.handle),
);
router.delete("/v1/user/:id", authVerificationMiddleware, asyncHandler(DeleteUserController.handle));

module.exports = router;
