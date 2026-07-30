import { Router, type IRouter } from "express";
import { z } from "zod";
import { readData, writeData } from "../lib/dataManager.js";

const router: IRouter = Router();
const MESSAGES_FILE = "contact-messages.json";

const ContactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(5),
});

router.post("/contact", async (req, res) => {
  const parsed = ContactSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ ok: false, error: "Invalid form data" });
    return;
  }

  const { name, phone, email, subject, message } = parsed.data;

  // ── Always persist to local storage as backup ──────────────────────────────
  try {
    const messages = await readData<Array<Record<string, unknown>>>(MESSAGES_FILE, []);
    messages.unshift({
      id: crypto.randomUUID(),
      ...parsed.data,
      createdAt: new Date().toISOString(),
    });
    await writeData(MESSAGES_FILE, messages);
  } catch (saveErr) {
    req.log.warn({ saveErr }, "Failed to save message to local storage");
  }

  // ── Telegram notification ──────────────────────────────────────────────────
  const botToken =
    process.env["TELEGRAM_BOT_TOKEN"] ??
    "8744963558:AAGP0AT54wTpxjKsTTYkGy49jiWMb7EeCZo";
  const chatId = process.env["TELEGRAM_CHAT_ID"];

  if (!chatId) {
    // No chat ID configured — message was saved locally, return success
    res.json({ ok: true, stored: true });
    return;
  }

  const now = new Date().toLocaleString("uz-UZ", {
    timeZone: "Asia/Tashkent",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const text =
    `📩 <b>Yangi murojaat</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Ism:</b> ${esc(name)}\n` +
    `📞 <b>Telefon:</b> ${esc(phone)}\n` +
    `📧 <b>Email:</b> ${esc(email)}\n` +
    `📋 <b>Mavzu:</b> ${esc(subject)}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💬 <b>Xabar:</b>\n${esc(message)}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `⏰ <b>Vaqt:</b> ${now}`;

  try {
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    const telegramData = (await telegramRes.json()) as {
      ok: boolean;
      description?: string;
    };

    if (!telegramData.ok) {
      req.log.error({ telegramData }, "Telegram API error");
      // Message was already saved locally — still return success to the user
      res.json({ ok: true, stored: true });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to call Telegram API");
    // Message was already saved locally — still return success to the user
    res.json({ ok: true, stored: true });
  }
});

/** Escape HTML special characters for Telegram HTML parse_mode */
function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default router;
