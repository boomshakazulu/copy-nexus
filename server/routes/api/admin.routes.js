const router = require("express").Router();
const { getOrders, updateOrder, createOrder, getOrderId } = require("../../controllers/order.controller");
const {
  getRental,
  getRentalId,
  getRentals,
  createRental,
  updateRental,
  addRentalPayment,
  rentalExists,
  getRentalPayments,
  updateRentalPayment,
  deleteRentalPayment,
} = require("../../controllers/rental.controller");
const { getAccessLogs, createAccessLog } = require("../../controllers/accessLog.controller");
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
router.get("/order-id", wrap(getOrderId));
router.post("/order", wrap(createOrder));
router.put("/order", wrap(updateOrder));
router.put("/orders", wrap(updateOrder));
router.get("/rental-exists", wrap(rentalExists));
router.get("/rental", wrap(getRental));
router.get("/rental-id", wrap(getRentalId));
router.get("/rentals", wrap(getRentals));
router.post("/rental", wrap(createRental));
router.put("/rental", wrap(updateRental));
router.post("/rental-payment", wrap(addRentalPayment));
router.get("/rental-payments", wrap(getRentalPayments));
router.put("/rental-payment", wrap(updateRentalPayment));
router.delete("/rental-payment", wrap(deleteRentalPayment));
router.get("/access-logs", wrap(getAccessLogs));
router.post("/access-logs", wrap(createAccessLog));
router.get("/reports", wrap(getReports));
router.get("/dashboard", wrap(getDashboard));
router.post("/product", wrap(createProduct));
router.put("/product", wrap(updateProduct));

module.exports = router;
