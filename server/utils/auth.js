const jwt = require("jsonwebtoken");
const secret = process.env.SECRET_JWT;
const expiration = "24h";
const { unauthorized, forbidden } = require("./httpError");

function requireAuth(req, res, next) {
  const body = req.body || {};
  const query = req.query || {};
  const headers = req.headers || {};
  let token = body.token || query.token || headers.authorization;
  if (req.headers.authorization) token = token.split(" ").pop().trim();
  if (!token) return next(unauthorized("No token provided"));

  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration });
    req.user = data;
    next();
  } catch (e) {
    return next(unauthorized("Invalid or expired token"));
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized("Unauthorized"));
    if (req.user.role !== role)
      return next(forbidden("Forbidden"));
    next();
  };
}

function signToken({ email, id, role }) {
  return jwt.sign({ data: { email, id, role } }, secret, {
    expiresIn: expiration,
  });
}

module.exports = { requireAuth, requireRole, signToken };
