const router = require("express").Router();
const { createOrder } = require("../../controllers/order.controller");
const { rateLimit } = require("../../utils/rateLimit");

const { requireAuth, requireRole } = require("../../utils/auth");

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post(
  "/",
  rateLimit({ windowMs: 60 * 1000, max: 10, message: "Too many requests." }),
  wrap(createOrder)
);

module.exports = router;
