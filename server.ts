// Minimal dev/prod static server for the Vite frontend.
//
// NOTE: This project's real API is the Python FastAPI backend (app.py).
// This file only serves the Vite app during local development (`npm run dev`)
// and static files in production — it no longer contains a mock API.
// Configure VITE_API_BASE_URL to point the frontend at app.py (see .env.example).

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Frontend dev server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
