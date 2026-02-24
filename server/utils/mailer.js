const nodemailer = require("nodemailer");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  SMTP_FROM,
} = process.env;

let cachedTransport = null;

const getTransport = () => {
  if (cachedTransport) return cachedTransport;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  const secure =
    String(SMTP_SECURE || "").toLowerCase() === "true" ||
    String(SMTP_PORT) === "465";
  cachedTransport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  return cachedTransport;
};

const getFrom = () => SMTP_FROM || SMTP_USER || "no-reply@copynexus.local";
const isConfigured = () =>
  !!SMTP_HOST && !!SMTP_PORT && !!SMTP_USER && !!SMTP_PASS;

async function sendMail({ to, subject, text, html }) {
  const transport = getTransport();
  if (!transport) {
    console.warn("SMTP not configured. Email skipped:", subject);
    return { skipped: true };
  }
  const info = await transport.sendMail({
    from: getFrom(),
    to,
    subject,
    text,
    html,
  });
  return info;
}

module.exports = {
  sendMail,
  getFrom,
  isConfigured,
};
