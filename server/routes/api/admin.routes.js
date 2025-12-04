const router = require("express").Router();
const { getOrders } = require("../../controllers/order.controller");
const {
  createProduct,
  updateProduct,
} = require("../../controllers/product.controller");
const { requireAuth, requireRole } = require("../../utils/auth");

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.use(requireAuth, requireRole("admin"));

router.get("/orders", wrap(getOrders));
router.post("/product", wrap(createProduct));
router.put("/product", wrap(updateProduct));

module.exports = router;
