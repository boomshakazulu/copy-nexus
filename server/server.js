const express = require("express");
require("dotenv").config();
const db = require("./config/connection");
const routes = require("./routes");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());
app.use(helmet());
//logs incoming requests
app.use(morgan("dev"));

app.use("/api/v1", routes);

app.get("/health", (_req, res) => res.send("ok"));

// 404 + error handlers (after routes)
app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, _req, res, _next) => {
  console.error(err);

  // Duplicate key (e.g., unique email)
  if (err?.code === 11000) {
    // try to name the offending field for a nicer message
    const field =
      (err.keyPattern && Object.keys(err.keyPattern)[0]) ||
      (err.keyValue && Object.keys(err.keyValue)[0]) ||
      "field";
    return res.status(409).json({ error: `${field} already registered` });
  }

  // Mongoose validation errors
  if (err?.name === "ValidationError") {
    const details = Object.fromEntries(
      Object.entries(err.errors || {}).map(([k, v]) => [k, v.message])
    );
    return res.status(400).json({ error: "Invalid data", details });
  }

  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
