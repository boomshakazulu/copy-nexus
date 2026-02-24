const { sendMail } = require("../utils/mailer");

const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL;

const isNonEmpty = (value) => typeof value === "string" && value.trim().length;

const normalizeContactMethod = (value) =>
  String(value || "").trim().toLowerCase();

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const isValidPhone = (value) =>
  String(value || "").replace(/\D/g, "").length >= 7;

const isValidContact = (method, value) => {
  if (!isNonEmpty(value)) return false;
  if (method === "email") return isValidEmail(value);
  if (method === "whatsapptext") return isValidPhone(value);
  if (method === "whatsappcall") return isValidPhone(value);
  return true;
};

async function submitContact(req, res, next) {
  try {
    const {
      name,
      contactMethod,
      contactValue,
      message,
    } = req.body || {};

    const trimmedName = String(name || "").trim();
    const trimmedContactMethod = normalizeContactMethod(contactMethod);
    const trimmedContactValue = String(contactValue || "").trim();
    const trimmedMessage = String(message || "").trim();

    if (
      !isNonEmpty(trimmedName) ||
      !isNonEmpty(trimmedMessage) ||
      !isNonEmpty(trimmedContactMethod) ||
      !isValidContact(trimmedContactMethod, trimmedContactValue)
    ) {
      return res.status(422).json({
        error: {
          message: "Invalid contact request",
          code: "validation_error",
        },
      });
    }

    if (!ADMIN_NOTIFY_EMAIL) {
      return res.status(500).json({
        error: {
          message: "Admin notification email not configured",
          code: "email_not_configured",
        },
      });
    }

    const subject = `New contact request from ${trimmedName}`;
    const text = [
      `Name: ${trimmedName}`,
      `Contact Method: ${trimmedContactMethod}`,
      `Contact Value: ${trimmedContactValue}`,
      "",
      "Message:",
      trimmedMessage,
    ].join("\n");

    const html = `
      <p><strong>Name:</strong> ${trimmedName}</p>
      <p><strong>Contact Method:</strong> ${trimmedContactMethod}</p>
      <p><strong>Contact Value:</strong> ${trimmedContactValue}</p>
      <p><strong>Message:</strong></p>
      <p>${trimmedMessage.replace(/\n/g, "<br />")}</p>
    `;

    await sendMail({
      to: ADMIN_NOTIFY_EMAIL,
      subject,
      text,
      html,
    });

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  submitContact,
};
