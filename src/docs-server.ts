/**
 * Aruvi Agent SDK — standalone API documentation server.
 *
 * Starts a lightweight Hono server that serves:
 *   GET /api             → Scalar interactive API reference UI
 *   GET /openapi.json    → Raw OpenAPI 3.0 spec (JSON)
 *
 * Usage:
 *   bun run docs                  # default port 4000
 *   PORT=8080 bun run docs        # custom port
 */

import { Hono } from "hono";
import { Scalar } from "@scalar/hono-api-reference";
import { openApiSpec } from "./runtime/openapi-spec.js";

const PORT = Number(process.env.PORT ?? 4000);

const app = new Hono();

// Raw spec — consumed by the Scalar UI
app.get("/openapi.json", (c) => c.json(openApiSpec));

// Scalar interactive docs at /api
app.get(
  "/api",
  Scalar({
    url: "/openapi.json",
    theme: "elysiajs",
    pageTitle: "Aruvi Agent SDK — API Reference",
  })
);

// Redirect root to /api for convenience
app.get("/", (c) => c.redirect("/api"));

console.log(`\n📖  Aruvi Agent SDK — API Docs`);
console.log(`    Local:  http://localhost:${PORT}/api`);
console.log(`    Spec:   http://localhost:${PORT}/openapi.json\n`);

export default {
  port: PORT,
  fetch: app.fetch,
};
