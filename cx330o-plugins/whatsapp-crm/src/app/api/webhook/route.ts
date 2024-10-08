/**
 * WhatsApp Cloud API Webhook Handler
 *
 * GET  — Meta webhook verification
 * POST — Incoming messages → Notion CRM + auto-reply
 */
import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || "";
const WA_TOKEN = process.env.WA_ACCESS_TOKEN || "";
const WA_PHONE_ID = process.env.WA_PHONE_NUMBER_ID || "";
const NOTION_TOKEN = process.env.NOTION_TOKEN || "";
const CUSTOMER_DB = process.env.NOTION_CUSTOMER_DB_ID || "";
const RESERVATION_DB = process.env.NOTION_RESERVATION_DB_ID || "";
const FORM_BASE_URL = process.env.NEXT_PUBLIC_FORM_URL || "";
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || "";

// --- WhatsApp helpers ---

async function sendWhatsApp(to: string, text: string) {
  await fetch(`https://graph.facebook.com/v17.0/${WA_PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } }),
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

async function findOrCreateCustomer(phone: string, name: string) {
  const data = await notionQuery(CUSTOMER_DB, { property: "WhatsApp番号", phone_number: { equals: phone } });
  if (data.results?.length > 0) return data.results[0].id;

  const page = await notionCreate(CUSTOMER_DB, {
    "名前": { title: [{ text: { content: name || phone } }] },
    "WhatsApp番号": { phone_number: phone },
    "プロフィール名": { rich_text: [{ text: { content: name } }] },
    "ステータス": { select: { name: "active" } },
  });
  return page.id;
}

async function createReservation(customerId: string, data: {
  date: string; guests: number; seating: string; request: string; phone: string;
}) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return notionCreate(RESERVATION_DB, {
    "予約ID": { title: [{ text: { content: `${dateStr}_${data.phone}` } }] },
    "顧客": { relation: [{ id: customerId }] },
    "予約日時": { date: { start: data.date } },
    "人数": { number: data.guests },
    "席タイプ": { select: { name: data.seating } },
    "特別リクエスト": data.request ? { rich_text: [{ text: { content: data.request } }] } : undefined,
  });
}

function isReservationIntent(text: string): boolean {
  const keywords = ["reserve", "book", "table", "reservation", "จอง", "حجز", "预约", "予約"];
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

    // Handle form submission (from reservation form)
    if (body.phone && body.date) {
      const customerId = await findOrCreateCustomer(body.phone, "");
      await createReservation(customerId, body);
      await sendWhatsApp(body.phone, "✅ Your reservation is confirmed! See you soon.");
      await notifySlack(`🍽️ New reservation: ${body.phone} on ${body.date}, ${body.guests} guests`);
      return NextResponse.json({ ok: true });
    }

    // Handle WhatsApp webhook
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;
    if (!messages?.length) return NextResponse.json({ ok: true });

    for (const msg of messages) {
      const from = msg.from; // E.164 phone
      const name = changes.value.contacts?.[0]?.profile?.name || "";
      const text = msg.text?.body || "";

      await findOrCreateCustomer(from, name);

      if (isReservationIntent(text)) {
        const formUrl = `${FORM_BASE_URL}?phone=${encodeURIComponent(from)}&lang=en`;
        await sendWhatsApp(from, `Great! Please fill out the reservation form:\n${formUrl}`);
      } else {
        await sendWhatsApp(from, "Thank you for your message! To make a reservation, just say 'book a table'.");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await notifySlack(`❌ Webhook error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
