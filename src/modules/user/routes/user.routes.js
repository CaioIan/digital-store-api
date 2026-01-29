const express = require("express");
const createUserController = require("../http/controllers/create-user.controller");
const getUserByIdController = require("../http/controllers/get-user-by-id.controller");
const { createUserValidation } = require("../http/validators/create-user.validator");

const router = express.Router();

router.post("/v1/user", createUserValidation, createUserController.handle);
router.get("/v1/user/:id", getUserByIdController.handle);

module.exports = router;
