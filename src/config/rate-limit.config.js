/**
 * Middleware global de Rate Limit configurado para limitar conexões.
 */
const rateLimit = require("express-rate-limit");

// Helper para não bloquear a bateria de testes integrativos automatizados do Jest
const skipIfTesting = () => process.env.NODE_ENV === "test";

/**
 * Middleware global de Rate Limit configurado para limitar conexões.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, // Limite generoso focado na navegação da loja e vitrines
  message: {
    status: 429,
    message: "Muitas requisições. Tente novamente em 15 minutos",
  },
  headers: true,
  skip: skipIfTesting,
});

/**
 * Middleware restrito para rotas Sensíveis (Login)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, // Apenas 5 tentativas de login a cada 15 min 
  message: {
    status: 429,
    message: "Múltiplas tentativas de login falhas. Sua conta ou IP foi bloqueado por segurança. Volte em 15 minutos.",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
  skip: skipIfTesting,
});

/**
 * Middleware Super Restrito para criação de novas contas
 */
const createAccountLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // Janela de 5 minutos
  max: 5, // Apenas 5 contas podem ser criadas pelo mesmo IP a cada 5 minutos
  message: {
    status: 429,
    message: "Muitas requisições. Tente novamente em 5 minutos",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
  skip: skipIfTesting,
});

module.exports = {
  globalLimiter,
  authLimiter,
  createAccountLimiter
};
