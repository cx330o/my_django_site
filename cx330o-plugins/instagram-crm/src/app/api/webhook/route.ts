/**
 * Instagram Messenger API Webhook Handler
 *
 * GET  — Meta webhook verification
 * POST — Incoming DMs → Notion CRM + auto-reply
 */
import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.IG_VERIFY_TOKEN || "";
const PAGE_TOKEN = process.env.IG_PAGE_ACCESS_TOKEN || "";
const NOTION_TOKEN = process.env.NOTION_TOKEN || "";
const CUSTOMER_DB = process.env.NOTION_CUSTOMER_DB_ID || "";
const APPOINTMENT_DB = process.env.NOTION_APPOINTMENT_DB_ID || "";
const FORM_BASE_URL = process.env.NEXT_PUBLIC_FORM_URL || "";
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || "";

// --- Instagram DM helpers ---

async function sendInstagramDM(recipientId: string, text: string) {
  await fetch(`https://graph.facebook.com/v17.0/me/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
      access_token: PAGE_TOKEN,
    }),
  });
}

// --- Notion helpers ---

async function notionQuery(dbId: string, filter: Record<string, unknown>) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${NOTION_TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
    body: JSON.stringify({ filter }),
  });
  return res.json();
}

async function notionCreate(dbId: string, properties: Record<string, unknown>) {
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: { Authorization: `Bearer ${NOTION_TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
    body: JSON.stringify({ parent: { database_id: dbId }, properties }),
  });
  return res.json();
}

async function findOrCreateCustomer(igId: string, username: string) {
  const data = await notionQuery(CUSTOMER_DB, { property: "Instagram ID", rich_text: { equals: igId } });
  if (data.results?.length > 0) return data.results[0].id;

  const page = await notionCreate(CUSTOMER_DB, {
    "名前": { title: [{ text: { content: username || igId } }] },
    "Instagram ID": { rich_text: [{ text: { content: igId } }] },
    "Instagram ユーザー名": username ? { rich_text: [{ text: { content: username } }] } : undefined,
  });
  return page.id;
}

async function createAppointment(customerId: string, data: {
  name: string; date: string; menu: string; refImage: string; notes: string;
}) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const props: Record<string, unknown> = {
    "施術ID": { title: [{ text: { content: `${dateStr}_${data.name}_${data.menu}` } }] },
    "顧客": { relation: [{ id: customerId }] },
    "予約日時": { date: { start: data.date } },
    "メニュー": { select: { name: data.menu } },
  };
  if (data.refImage) props["参考画像"] = { url: data.refImage };
  if (data.notes) props["備考"] = { rich_text: [{ text: { content: data.notes } }] };
  return notionCreate(APPOINTMENT_DB, props);
}

function isBookingIntent(text: string): boolean {
  const keywords = ["book", "appointment", "reserve", "schedule", "disponible", "rendez-vous", "cita", "予約"];
  return keywords.some((k) => text.toLowerCase().includes(k));
}

async function notifySlack(message: string) {
  if (!SLACK_WEBHOOK) return;
  await fetch(SLACK_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: message }),
  }).catch(() => {});
}

// --- Webhook verification (GET) ---

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// --- Incoming messages (POST) ---

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle form submission
    if (body.ig_id && body.date && body.menu) {
      const customerId = await findOrCreateCustomer(body.ig_id, body.name || "");
      await createAppointment(customerId, body);
      await sendInstagramDM(body.ig_id, "💖 Your appointment is confirmed! We'll send you a reminder the day before.");
      await notifySlack(`💅 New appointment: ${body.name} — ${body.menu} on ${body.date}`);
      return NextResponse.json({ ok: true });
    }

    // Handle Instagram webhook
    const entry = body.entry?.[0];
    const messaging = entry?.messaging;
    if (!messaging?.length) return NextResponse.json({ ok: true });

    for (const event of messaging) {
      const senderId = event.sender?.id;
      const text = event.message?.text || "";
      if (!senderId || !text) continue;

      await findOrCreateCustomer(senderId, "");

      if (isBookingIntent(text)) {
        const formUrl = `${FORM_BASE_URL}?ig_id=${encodeURIComponent(senderId)}`;
        await sendInstagramDM(senderId, `Love to have you! Book your appointment here:\n${formUrl}`);
      } else {
        await sendInstagramDM(senderId, "Hey! 💕 Want to book an appointment? Just say 'book' and I'll send you the link!");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await notifySlack(`❌ IG Webhook error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
