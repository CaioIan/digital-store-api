const { verifyToken } = require("./jwt");

function authVerificationMiddleware(req, res, next) {
  let token = null;

  // 1. Tentar obter do cookie (HTTP-only)
  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  } 
  // 2. Falback para o Authorization Header
  else if (req.headers["authorization"] && req.headers["authorization"].startsWith("Bearer ")) {
    token = req.headers["authorization"].split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }

  req.user = payload; // Disponibiliza o payload do token para as próximas camadas
  next();
}

module.exports = authVerificationMiddleware;
