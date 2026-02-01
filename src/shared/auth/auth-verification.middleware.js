const { verifyToken } = require("./jwt");

function authVerificationMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }

  req.user = payload; // Disponibiliza o payload do token para as próximas camadas
  next();
}

module.exports = authVerificationMiddleware;
