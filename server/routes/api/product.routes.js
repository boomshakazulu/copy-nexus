const router = require("express").Router();

const {
  getProducts,
  createProduct,
} = require("../../controllers/product.controller");

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get("/", wrap(getProducts));
router.post("/", wrap(createProduct));

module.exports = router;
