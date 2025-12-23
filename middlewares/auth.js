const jwt = require("jsonwebtoken");
const UnauthorizedError = require("../errors/unauthorized-error");
let JWT_SECRET;
if (process.env.NODE_ENV !== "production") {
  // Código para desenvolvimento
  JWT_SECRET = "dev-secret";
} else {
  // Código para produção
  JWT_SECRET = process.env.JWT_SECRET;
}
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Autorização necessária"));
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return next(new UnauthorizedError("Token inválido"));
  }
};
