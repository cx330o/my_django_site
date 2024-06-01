/**
 * cx330o Marketing API Gateway
 * 
 * Unified entry point routing requests to Journey Builder / Mailer / Live Chat
 * and providing cross-service APIs (e.g., unified contact sync)
 */

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.use(express.json());

const JOURNEY_URL = process.env.JOURNEY_URL || "http://localhost:3010";
const MAILER_URL = process.env.MAILER_URL || "http://localhost:9000";
const CHAT_URL = process.env.CHAT_URL || "http://localhost:3011";

// Proxy routes
app.use("/journey", createProxyMiddleware({ target: JOURNEY_URL, changeOrigin: true, pathRewrite: { "^/journey": "" } }));
app.use("/mailer", createProxyMiddleware({ target: MAILER_URL, changeOrigin: true, pathRewrite: { "^/mailer": "" } }));
app.use("/chat", createProxyMiddleware({ target: CHAT_URL, changeOrigin: true, pathRewrite: { "^/chat": "" } }));

/**
 * Unified Contact Sync API
 * Syncs contacts to Journey Builder (marketing) + Mailer (email lists) + Live Chat (support)
 */
app.post("/api/contacts/sync", async (req, res) => {
  const { email, name, phone, attributes } = req.body;

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  const results = {};

  // Sync to Journey Builder
  try {
    const jRes = await fetch(`${JOURNEY_URL}/api/v1/identify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: email,
        traits: { email, name, phone, ...attributes },
      }),
    });
    results.journey = jRes.ok ? "ok" : "failed";
  } catch (e) {
    results.journey = `error: ${e.message}`;
  }

  // Sync to Mailer
  try {
    const mRes = await fetch(`${MAILER_URL}/api/subscribers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name: name || "",
        status: "enabled",
        lists: [1],
        attribs: attributes || {},
      }),
    });
    results.mailer = mRes.ok ? "ok" : "failed";
  } catch (e) {
    results.mailer = `error: ${e.message}`;
  }

  // Sync to Live Chat
  try {
    const cRes = await fetch(`${CHAT_URL}/api/v1/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || email,
        email,
        phone_number: phone || "",
      }),
    });
    results.chat = cRes.ok ? "ok" : "failed";
  } catch (e) {
    results.chat = `error: ${e.message}`;
  }

  res.json({ status: "synced", results });
});

/**
 * Lead Scoring Engine
 * Evaluates lead score based on behavioral events
 */
app.post("/api/scoring/evaluate", (req, res) => {
  const { events } = req.body;
  let score = 0;

  const SCORING_RULES = {
    email_opened: 5,
    email_clicked: 15,
    page_visited: 3,
    form_submitted: 25,
    download: 20,
    social_share: 10,
    reply_received: 30,
    meeting_booked: 50,
  };

  for (const event of events || []) {
    score += SCORING_RULES[event.type] || 0;
  }

  const tier = score >= 80 ? "hot" : score >= 40 ? "warm" : "cold";
  res.json({ score, tier, max_possible: 100 });
});

app.get("/health", (_, res) => {
  res.json({ status: "ok", services: ["journey", "mailer", "chat"] });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`cx330o Marketing Gateway on port ${PORT}`));
