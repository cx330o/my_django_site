/**
 * cx330o Email Parser Service
 * 
 * Receives Sendgrid Inbound Parse webhooks, parses email content,
 * and creates/updates contacts and activity records in cx330o CRM.
 */

const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const CRM_API_URL = process.env.CRM_API_URL || "http://localhost:3000";

/**
 * Sendgrid Inbound Parse Webhook
 * 接收转发的邮件，解析后推送到 CRM
 */
app.post("/webhook/sendgrid", upload.any(), async (req, res) => {
  try {
    const { from, to, subject, text, html } = req.body;

    // 解析发件人信息
    const senderMatch = (from || "").match(/(?:(.+?)\s*)?<?([^>]+@[^>]+)>?/);
    const senderName = senderMatch?.[1]?.trim() || "";
    const senderEmail = senderMatch?.[2]?.trim() || "";

    if (!senderEmail) {
      return res.status(400).json({ error: "No sender email found" });
    }

    console.log(`📧 Received email from: ${senderName} <${senderEmail}>`);
    console.log(`   Subject: ${subject}`);

    // Find or create contact in cx330o CRM
    // Uses CRM REST API (requires API token in production)
    const contactData = {
      name: { firstName: senderName.split(" ")[0] || "", lastName: senderName.split(" ").slice(1).join(" ") || "" },
      emails: { primaryEmail: senderEmail },
    };

    // 创建活动记录
    const activityData = {
      title: subject || "Email received",
      body: text || html || "",
      type: "EMAIL",
    };

    console.log(`   ✅ Parsed and ready for CRM update`);

    // TODO: Call CRM API
    // await fetch(`${CRM_API_URL}/api/contacts`, { method: 'POST', body: JSON.stringify(contactData) });
    // await fetch(`${CRM_API_URL}/api/activities`, { method: 'POST', body: JSON.stringify(activityData) });

    res.json({ status: "ok", sender: senderEmail, subject });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 通用邮件解析 API — 手动推送邮件内容
 */
app.post("/api/parse-email", async (req, res) => {
  const { raw_email, from, subject, body } = req.body;

  // 简单解析
  const parsed = {
    from: from || "",
    subject: subject || "",
    body: body || "",
    parsed_at: new Date().toISOString(),
  };

  res.json({ status: "ok", parsed });
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Email Parser running on port ${PORT}`));
