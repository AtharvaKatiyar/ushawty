import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

const urlMap = {};

const VERSION = process.env.VERSION || "v1";
const DEPLOY_TIME = new Date().toISOString();

if (process.env.SIMULATE_CRASH === "true") {
  setTimeout(() => {
    console.log("💥 Simulated delayed crash");
    process.exit(1);
  }, 120000);
}

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: VERSION
  });
});

app.get("/info", (req, res) => {
  res.json({
    version: VERSION,
    deployedAt: DEPLOY_TIME
  });
});

app.post("/shorten", (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const id = nanoid(6);
    urlMap[id] = url;

    const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

    res.json({
      shortUrl: `${BASE_URL}/${id}`,
      id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/:id", (req, res) => {
  try {
    const originalUrl = urlMap[req.params.id];

    if (originalUrl) {
      return res.redirect(originalUrl);
    }

    res.status(404).send("Not found");
  } catch (err) {
    console.error(err);
    res.status(500).send("Redirect failed");
  }
});

export default app;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}