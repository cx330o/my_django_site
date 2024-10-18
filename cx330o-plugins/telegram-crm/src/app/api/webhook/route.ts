/**
 * Telegram Bot Webhook Handler
 *
 * POST — Incoming messages + callback queries → Notion CRM + auto-reply
 */
import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TG_BOT_TOKEN || "";
const WEBHOOK_SECRET = process.env.TG_WEBHOOK_SECRET || "";
const NOTION_TOKEN = process.env.NOTION_TOKEN || "";
const STUDENT_DB = process.env.NOTION_STUDENT_DB_ID || "";
const LESSON_DB = process.env.NOTION_LESSON_DB_ID || "";
const FORM_BASE_URL = process.env.NEXT_PUBLIC_FORM_URL || "";
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || "";

// --- Telegram helpers ---

async function tgSend(chatId: number | string, text: string, replyMarkup?: unknown) {
  const body: Record<string, unknown> = { chat_id: chatId, text, parse_mode: "HTML" };
  if (replyMarkup) body.reply_markup = replyMarkup;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function tgAnswerCallback(callbackQueryId: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
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

async function findOrCreateStudent(chatId: number, username: string, firstName: string) {
  const data = await notionQuery(STUDENT_DB, { property: "Telegram ID", number: { equals: chatId } });
  if (data.results?.length > 0) return data.results[0].id;

  const name = firstName || username || String(chatId);
  const props: Record<string, unknown> = {
    "名前": { title: [{ text: { content: name } }] },
    "Telegram ID": { number: chatId },
    "ステータス": { select: { name: "問い合わせ" } },
  };
  if (username) props["Telegram ユーザー名"] = { rich_text: [{ text: { content: `@${username}` } }] };

  const page = await notionCreate(STUDENT_DB, props);
  return page.id;
}

async function createLesson(studentId: string, data: {
  name: string; date: string; course: string; format: string; notes: string;
}) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const props: Record<string, unknown> = {
    "レッスンID": { title: [{ text: { content: `${dateStr}_${data.name}_${data.course}` } }] },
    "生徒": { relation: [{ id: studentId }] },
    "日時": { date: { start: data.date } },
    "コース": { select: { name: data.course } },
    "形式": { select: { name: data.format } },
  };
  if (data.notes) props["フィードバック"] = { rich_text: [{ text: { content: data.notes } }] };
  return notionCreate(LESSON_DB, props);
}

async function notifySlack(message: string) {
  if (!SLACK_WEBHOOK) return;
  await fetch(SLACK_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: message }),
  }).catch(() => {});
}

const COURSE_INFO: Record<string, string> = {
  english: "🇬🇧 <b>English</b>\nBeginner to Advanced. IELTS/TOEFL prep available.\n4x/week, 60 min sessions.",
  japanese: "🇯🇵 <b>Japanese</b>\nN5→N1 track. Business Japanese available.\n3x/week, 90 min sessions.",
  chinese: "🇨🇳 <b>Chinese (Mandarin)</b>\nHSK prep. Conversational & Business tracks.\n3x/week, 60 min sessions.",
  programming: "💻 <b>Programming</b>\nPython, JavaScript, Web Dev.\nProject-based learning. 2x/week.",
  design: "🎨 <b>Design</b>\nUI/UX, Graphic Design, Figma.\nPortfolio-focused. 2x/week.",
};

// --- Webhook handler ---

export async function POST(req: NextRequest) {
  try {
    // Verify secret token
    const secret = req.headers.get("x-telegram-bot-api-secret-token") || "";
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Handle form submission (from trial lesson form)
    if (body.chat_id && body.date && body.course) {
      const studentId = await findOrCreateStudent(Number(body.chat_id), "", body.name || "");
      await createLesson(studentId, body);
      await tgSend(body.chat_id, "🎓 Your trial lesson is booked! We'll send you a reminder before the session.");
      await notifySlack(`📚 New trial lesson: ${body.name} — ${body.course} on ${body.date}`);
      return NextResponse.json({ ok: true });
    }

    // Handle Telegram update
    const message = body.message;
    const callbackQuery = body.callback_query;

    if (callbackQuery) {
      const chatId = callbackQuery.message?.chat?.id;
      const data = callbackQuery.data;
      await tgAnswerCallback(callbackQuery.id);

      if (data?.startsWith("course_")) {
        const courseId = data.replace("course_", "");
        const info = COURSE_INFO[courseId] || "Course info not available.";
        await tgSend(chatId, `${info}\n\nInterested? Use /book to sign up for a free trial!`);
      }
      return NextResponse.json({ ok: true });
    }

    if (!message?.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const username = message.from?.username || "";
    const firstName = message.from?.first_name || "";
    const text = message.text.trim();

    await findOrCreateStudent(chatId, username, firstName);

    if (text === "/start") {
      await tgSend(chatId,
        `Welcome, ${firstName || "there"}! 👋\n\nWe offer language & skill courses. Here's what you can do:\n\n` +
        `/courses — Browse our courses\n/book — Book a free trial lesson\n/schedule — View your bookings\n\n` +
        `Or just ask me anything!`
      );
    } else if (text === "/courses") {
      await tgSend(chatId, "Choose a course to learn more:", {
        inline_keyboard: [
          [{ text: "🇬🇧 English", callback_data: "course_english" }, { text: "🇯🇵 Japanese", callback_data: "course_japanese" }],
          [{ text: "🇨🇳 Chinese", callback_data: "course_chinese" }, { text: "💻 Programming", callback_data: "course_programming" }],
          [{ text: "🎨 Design", callback_data: "course_design" }],
        ],
      });
    } else if (text === "/book") {
      const formUrl = `${FORM_BASE_URL}?chat_id=${chatId}&lang=en`;
      await tgSend(chatId, `Great choice! Fill out the form to book your free trial:\n${formUrl}`);
    } else if (text === "/schedule") {
      const data = await notionQuery(LESSON_DB, {
        and: [
          { property: "生徒", relation: { contains: "" } }, // simplified — would need student ID lookup
          { property: "ステータス", status: { does_not_equal: "キャンセル" } },
        ],
      });
      if (data.results?.length > 0) {
        const list = data.results.slice(0, 5).map((p: Record<string, unknown>) => {
          const props = p.properties as Record<string, Record<string, unknown>>;
          const title = (props["レッスンID"]?.title as Array<{ plain_text: string }>)?.[0]?.plain_text || "—";
          const date = (props["日時"]?.date as { start: string })?.start || "—";
          return `📅 ${date} — ${title}`;
        }).join("\n");
        await tgSend(chatId, `Your upcoming lessons:\n\n${list}`);
      } else {
        await tgSend(chatId, "No upcoming lessons. Use /book to schedule a trial!");
      }
    } else {
      // Free text — simple intent detection
      const bookKeywords = ["book", "trial", "lesson", "sign up", "записаться", "урок", "đăng ký", "học thử"];
      if (bookKeywords.some((k) => text.toLowerCase().includes(k))) {
        const formUrl = `${FORM_BASE_URL}?chat_id=${chatId}&lang=en`;
        await tgSend(chatId, `Sure! Book your trial lesson here:\n${formUrl}`);
      } else {
        await tgSend(chatId, "Thanks for your message! 📩\n\nUse /courses to browse courses or /book to schedule a free trial.");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await notifySlack(`❌ TG Bot error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
