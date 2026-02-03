const router = require("express").Router();
const apiRoutes = require("./api");
const { notFound } = require("../utils/httpError");

router.use("/", apiRoutes);

router.use((req, _res, next) => next(notFound("Route not found")));

module.exports = router;
