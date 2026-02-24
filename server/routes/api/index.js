const router = require("express").Router();
const userRoutes = require("./user.routes");
const productRoutes = require("./product.routes");
const orderRoutes = require("./order.routes");
const adminRoutes = require("./admin.routes");
const contactRoutes = require("./contact.routes");
const imageProxyRoutes = require("./imageProxy.routes");

router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/contact", contactRoutes);
router.use("/images/proxy", imageProxyRoutes);

module.exports = router;
