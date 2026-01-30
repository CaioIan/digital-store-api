const express = require("express");
const createUserController = require("../http/controllers/create-user.controller");
const getUserByIdController = require("../http/controllers/get-user-by-id.controller");
const loginController = require("../http/controllers/login.controller");
const { createUserValidation } = require("../http/validators/create-user.validator");
const { loginValidation } = require("../http/validators/login.validator");

const router = express.Router();

router.post("/v1/user/login", loginValidation, loginController.handle);
router.post("/v1/user", createUserValidation, createUserController.handle);
router.get("/v1/user/:id", getUserByIdController.handle);

module.exports = router;
