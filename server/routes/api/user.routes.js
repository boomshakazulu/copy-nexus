const router = require("express").Router();
const { getUser, createUser } = require("../../controllers/user.controller");

const { requireAuth, requireRole } = require("../../utils/auth");

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get("/user", requireAuth, wrap(getUser));
router.post("/create", wrap(createUser));

module.exports = router;
