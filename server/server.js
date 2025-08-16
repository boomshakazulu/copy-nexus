const express = require("express");
const db = require("./config/connection");
const routes = require("./routes");

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
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
