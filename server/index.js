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

app.get("/health", (req, res) => {
  res.status(200).send("OK");
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
  const originalUrl = urlMap[req.params.id];

  if (originalUrl) {
    return res.redirect(originalUrl);
  }

  res.status(404).send("Not found");
});

export default app;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}