const router = require("express").Router();
const { submitContact } = require("../../controllers/contact.controller");
const { rateLimit } = require("../../utils/rateLimit");

router.post(
  "/",
  rateLimit({ windowMs: 60 * 1000, max: 5, message: "Too many messages." }),
  submitContact
);

module.exports = router;
