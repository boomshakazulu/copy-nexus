const router = require("express").Router();
const { getOrders, updateOrder } = require("../../controllers/order.controller");
const { getAccessLogs } = require("../../controllers/accessLog.controller");
const { getReports, getDashboard } = require("../../controllers/report.controller");
const {
  createProduct,
  updateProduct,
} = require("../../controllers/product.controller");
const { requireAuth, requireRole } = require("../../utils/auth");

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.use(requireAuth, requireRole("admin"));

router.get("/orders", wrap(getOrders));
router.put("/order", wrap(updateOrder));
router.put("/orders", wrap(updateOrder));
router.get("/access-logs", wrap(getAccessLogs));
router.get("/reports", wrap(getReports));
router.get("/dashboard", wrap(getDashboard));
router.post("/product", wrap(createProduct));
router.put("/product", wrap(updateProduct));

module.exports = router;
