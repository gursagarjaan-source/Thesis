// ═══════════════════════════════════════════════════════════════════
//  notify-telegram.js  —  Send new job notifications to Telegram
//
//  Reads notification-queue.json, sends formatted messages to a
//  Telegram channel/group via Bot API, then clears the queue.
//
//  Usage:
//    TELEGRAM_BOT_TOKEN=xxxx TELEGRAM_CHAT_ID=@channel node scripts/notify-telegram.js
//
//  Free tier: Telegram Bot API has no cost, 30 msg/sec limit.
// ═══════════════════════════════════════════════════════════════════

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const NOTIF_FILE  = path.join(__dirname, "..", "public", "notification-queue.json");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error("Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars.");
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ── Load queue ──────────────────────────────────────────────────
function loadQueue() {
  try {
    if (fs.existsSync(NOTIF_FILE)) {
      return JSON.parse(fs.readFileSync(NOTIF_FILE, "utf-8"));
    }
  } catch (_) {}
  return { pending: [], sent: [] };
}

function saveQueue(data) {
  fs.writeFileSync(NOTIF_FILE, JSON.stringify(data, null, 2));
}

// ── Format a job for Telegram ───────────────────────────────────
function formatMessage(item) {
  const trustIcon = item.trustLevel === "official" ? "✅" :
                    item.trustLevel === "aggregator" ? "⚠️" : "❓";

  const tabIcon = item.tab === "agriculture" ? "🌱" :
                  item.tab === "private" ? "💼" : "🏛️";

  let msg = `${tabIcon} <b>${escHtml(item.title)}</b>\n`;
  msg += `🏢 ${escHtml(item.organization)}\n`;

  if (item.deadline && item.deadline !== "Not Specified") {
    msg += `📅 Deadline: <b>${item.deadline}</b>\n`;
  }

  if (item.salary && item.salary !== "Not Disclosed") {
    msg += `💰 ${escHtml(item.salary)}\n`;
  }

  if (item.vacancies && item.vacancies !== "Not Specified") {
    msg += `👥 Vacancies: ${escHtml(item.vacancies)}\n`;
  }

  msg += `${trustIcon} Trust: ${item.trustLevel || "unknown"}\n`;

  if (item.link) {
    msg += `\n🔗 <a href="${escHtml(item.link)}">View Details</a>`;
  }

  msg += `\n\n<i>via KhetLab Student Hub</i>`;

  return msg;
}

function escHtml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Send to Telegram ────────────────────────────────────────────
async function sendMessage(text) {
  const res = await fetch(`${API_BASE}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API ${res.status}: ${err.slice(0, 200)}`);
  }

  return await res.json();
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  console.log("=".repeat(50));
  console.log(" KhetLab Telegram Notifier");
  console.log("=".repeat(50));

  const queue = loadQueue();
  const pending = queue.pending || [];

  if (pending.length === 0) {
    console.log("No pending notifications. Done.");
    return;
  }

  console.log(`${pending.length} notification(s) to send...`);

  const sent = [];
  const failed = [];

  for (const item of pending) {
    try {
      const msg = formatMessage(item);
      await sendMessage(msg);
      console.log(`  ✓ ${item.title}`);
      sent.push({ ...item, sentAt: new Date().toISOString() });

      // Rate limit: wait 1s between messages
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  ✗ ${item.title}: ${err.message}`);
      failed.push(item);
    }
  }

  // Update queue: move sent items, keep failed for retry
  queue.pending = failed;
  queue.sent = [...sent, ...(queue.sent || [])].slice(0, 100);
  queue.lastNotified = new Date().toISOString();
  saveQueue(queue);

  console.log(`\nSent: ${sent.length} | Failed: ${failed.length}`);
  console.log("=".repeat(50));
}

main().catch(err => {
  console.error("FATAL:", err.message);
  process.exit(1);
});
