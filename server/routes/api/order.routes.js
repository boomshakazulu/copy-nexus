const router = require("express").Router();
const { createOrder } = require("../../controllers/order.controller");

const { requireAuth, requireRole } = require("../../utils/auth");

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post("/", wrap(createOrder));

module.exports = router;
