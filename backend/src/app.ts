import express, { type Express } from "express";
import { searchRouter } from "./routes/search.js";

// App factory (not a running server) so tests can mount it without a port.
export function createApp(): Express {
  const app = express();
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/search", searchRouter());
  return app;
}
