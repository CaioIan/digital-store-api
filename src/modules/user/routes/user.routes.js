const express = require("express");
const createUserController = require("../http/controllers/create-user.controller");
const getUserByIdController = require("../http/controllers/get-user-by-id.controller");
const loginController = require("../http/controllers/login.controller");
const updateUserController = require("../http/controllers/update-user.controller");
const { createUserValidator } = require("../http/validators/create-user.validator");

const authVerificationMiddleware = require("../../../shared/auth/auth-verification.middleware");
const { loginValidator } = require("../http/validators/login.validator");
const { updateUserValidator } = require("../http/validators/update-user.validator");
const router = express.Router();

router.post("/v1/user/login", loginValidator, loginController.handle);
router.post("/v1/user", createUserValidator, createUserController.handle);
router.get("/v1/user/:id", authVerificationMiddleware, getUserByIdController.handle);
router.patch("/v1/user/:id", authVerificationMiddleware, updateUserValidator, updateUserController.handle);

module.exports = router;
