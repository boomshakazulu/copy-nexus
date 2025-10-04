const router = require("express").Router();
const {
  getOrders,
  createOrder,
} = require("../../controllers/order.controller");

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get("/", wrap(getOrders));
router.post("/", wrap(createOrder));

module.exports = router;
