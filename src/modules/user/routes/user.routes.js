const express = require('express');
const createUserController = require('../http/controllers/create-user.controller');
const { createUserValidation } = require('../http/validators/create-user.validator');

const router = express.Router();

router.post('/v1/user', createUserValidation, createUserController.handle)

module.exports = router;
