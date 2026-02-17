const router = require("express").Router();
const {
  getUser,
  createUser,
  requestSignup,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require("../../controllers/user.controller");

const { requireAuth, requireRole } = require("../../utils/auth");

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get("/user", requireAuth, wrap(getUser));
router.post("/create", wrap(createUser));
router.post("/signup-request", wrap(requestSignup));
router.post("/login", wrap(login));
router.post("/change-password", requireAuth, wrap(changePassword));
router.post("/forgot-password", wrap(forgotPassword));
router.post("/reset-password", wrap(resetPassword));
router.post("/verify-email", wrap(verifyEmail));

module.exports = router;
