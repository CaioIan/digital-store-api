const express = require('express');
const createUserController = require('../http/controllers/create-user.controller');
const { createUserValidation } = require('../http/validators/create-user.validator');
const { validationResult } = require('express-validator');

const router = express.Router();

router.post('/v1/user', createUserValidation, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  // Só chama o controller se não houver erro de validação
  return createUserController.handle(req, res, next);
});

module.exports = router;
