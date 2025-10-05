const router = require("express").Router();

const { getProducts } = require("../../controllers/product.controller");

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get("/", wrap(getProducts));

module.exports = router;
