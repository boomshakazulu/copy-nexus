const router = require("express").Router();
const { proxyImage } = require("../../controllers/imageProxy.controller");
const { rateLimit } = require("../../utils/rateLimit");

router.get(
  "/",
  rateLimit({ windowMs: 60 * 1000, max: 120, message: "Too many requests." }),
  proxyImage
);

module.exports = router;
