const jwt = require("jsonwebtoken");
const secret = process.env.SECRET_JWT;
const expiration = "24h";

function requireAuth(req, res, next) {
  let token = req.body.token || req.query.token || req.headers.authorization;
  if (req.headers.authorization) token = token.split(" ").pop().trim();
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration });
    req.user = data;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== role)
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

function signToken({ email, id, role }) {
  return jwt.sign({ data: { email, id, role } }, secret, {
    expiresIn: expiration,
  });
}

module.exports = { requireAuth, requireRole, signToken };
