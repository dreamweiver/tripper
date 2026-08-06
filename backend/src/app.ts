import express, { type Express } from "express";

// App factory (not a running server) so tests can mount it without a port.
export function createApp(): Express {
  const app = express();
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  return app;
}
