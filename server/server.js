const express = require("express");
require("dotenv").config();
const db = require("./config/connection");
const routes = require("./routes");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { notFound } = require("./utils/httpError");
const { isConfigured: isMailConfigured } = require("./utils/mailer");
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());
app.use(helmet());
//logs incoming requests
app.use(morgan("dev"));

app.use("/api/v1", routes);

app.get("/health", (_req, res) =>
  res.json({ ok: true, mailConfigured: isMailConfigured() })
);

// 404 + error handlers (after routes)
app.use((req, _res, next) => next(notFound("Not found")));

app.use((err, _req, res, _next) => {
  console.error(err);

  // Duplicate key (e.g., unique email)
  if (err?.code === 11000) {
    // try to name the offending field for a nicer message
    const field =
      (err.keyPattern && Object.keys(err.keyPattern)[0]) ||
      (err.keyValue && Object.keys(err.keyValue)[0]) ||
      "field";
    return res.status(409).json({
      error: {
        message: `${field} already registered`,
        code: "conflict",
      },
    });
  }

  // Mongoose validation errors
  if (err?.name === "ValidationError") {
    const details = Object.fromEntries(
      Object.entries(err.errors || {}).map(([k, v]) => [k, v.message])
    );
    return res.status(422).json({
      error: { message: "Invalid data", code: "validation_error", details },
    });
  }

  if (err?.name === "CastError") {
    return res.status(400).json({
      error: { message: "Invalid identifier", code: "invalid_id" },
    });
  }

  const status = err.status || 500;
  const code =
    err.code || (status >= 500 ? "server_error" : "error");
  const message = err.message || "Server error";
  const payload = { message, code };
  if (err.details) payload.details = err.details;
  res.status(status).json({ error: payload });
});

db.once("open", () => {
  if (!isMailConfigured()) {
    console.warn(
      "Warning: SMTP is not configured. Contact emails will be skipped."
    );
  }
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
