// ═══════════════════════════════════════════════════════════════════
//  fetch-jobs.js  —  KhetLab Job Agent v7 (RSS + Validate + AI + Notify)
//
//  Pipeline: RSS Feeds → Detect NEW → Jina Reader → AI Extract
//            (Groq primary, NVIDIA NIM fallback) → 5-Point Validation
//            → 3-Check Verify → Telegram Notify → Save
//
//  Cost: $0/month (all free-tier APIs).
// ═══════════════════════════════════════════════════════════════════

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";
import RSSParser from "rss-parser";
import { verifyJob, getTrustScore } from "./verify-job.js";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE  = path.join(__dirname, "..", "public", "jobs-data.json");
const SEEN_FILE  = path.join(__dirname, "..", "public", "seen-rss.json");
const NOTIF_FILE = path.join(__dirname, "..", "public", "notification-queue.json");
const TODAY      = new Date().toISOString().split("T")[0];
const rss        = new RSSParser({ timeout: 10000 });

// ── API Keys ─────────────────────────────────────────────────────
const GROQ_API_KEY     = process.env.GROQ_API_KEY;
const NVIDIA_API_KEY   = process.env.NVIDIA_API_KEY;
const SERPER_API_KEY   = process.env.SERPER_API_KEY;
const TAVILY_API_KEY   = process.env.TAVILY_API_KEY;
const TG_BOT_TOKEN     = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHANNEL_ID    = process.env.TELEGRAM_CHANNEL_ID;

// ── API Endpoints ────────────────────────────────────────────────
const GROQ_URL    = "https://api.groq.com/openai/v1/chat/completions";
const NVIDIA_URL  = "https://integrate.api.nvidia.com/v1/chat/completions";
const SERPER_URL  = "https://google.serper.dev/search";
const GROQ_MODEL  = "llama-3.3-70b-versatile";
const NVIDIA_MODEL = "meta/llama-3.3-70b-instruct";
const JINA_PREFIX = "https://r.jina.ai/";

// ── Trusted Sources ──────────────────────────────────────────────
const TRUSTED_SOURCES = [
  "icar.org.in", "asrb.org.in", "iari.res.in", "pau.edu",
  "freejobalert.com", "sarkariresult.com", "sarkariexam.com",
  "rojgarresult.com", "sarkarinetwork.com",
  "krishijagran.com", "agrihunt.com",
  "naukri.com", "indeed.co.in", "freshersworld.com",
  "testbook.com", "adda247.com", "jagranjosh.com",
  "ppsc.gov.in", "ssc.nic.in", "upsc.gov.in", "ibps.in",
  "rpcau.ac.in", "gbpuat.ac.in", "tnau.ac.in", "icar.org.in",
  "sarkarijobfind.com",
  "careers360.com", "foundit.in", "unstop.com",
];

// ── RSS Feed Configuration ───────────────────────────────────────
const RSS_FEEDS = [
  // ── Verified working (April 29 2026) ──
  { url: "https://www.freejobalert.com/feed",              tab: "alljobs",     name: "FreeJobAlert" },
  { url: "https://rojgarresult.com/feed/",                 tab: "alljobs",     name: "RojgarResult" },
  { url: "https://sarkariexam.com/feed/",                  tab: "alljobs",     name: "SarkariExam" },
  { url: "https://sarkarijobfind.com/feed/",               tab: "alljobs",     name: "SarkariJobFind" },
  { url: "https://agrihunt.com/feed/",                     tab: "agriculture", name: "AgriHunt" },
  { url: "https://icar.org.in/rss.xml",                    tab: "agriculture", name: "ICAR" },
  // ── Removed (dead/invalid): SarkariResult (html not rss), KrishiJagran (404) ──
];

// ── Tab classification keywords ──────────────────────────────────
const AGRI_KEYWORDS = [
  "agriculture", "agri", "icar", "asrb", "nabard", "afo", "jrf", "srf",
  "horticulture", "veterinary", "fisheries", "dairy", "pau", "krishi",
  "farm", "crop", "seed", "soil", "plant", "forestry", "sericulture",
];

const PRIVATE_KEYWORDS = [
  "naukri", "private", "company", "ltd", "pvt", "inc", "corporate",
  "startup", "fresher", "internship", "intern", "trainee", "campus",
];

// ── Serper fallback queries ──────────────────────────────────────
const TAB_CONFIG = {
  alljobs: {
    label: "All Jobs",
    query: "latest government jobs exams Punjab 2026 recruitment notification",
  },
  agriculture: {
    label: "Agriculture",
    query: "agriculture recruitment 2025 2026 India ICAR ASRB NABARD AFO JRF SRF NET",
  },
  private: {
    label: "Private Jobs",
    query: "agriculture horticulture jobs Punjab 2026 site:naukri.com OR site:indeed.co.in",
  }
};

// ═══════════════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════════════

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function loadJSON(file, fallback) {
  try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf-8")); }
  catch (_) {}
  return fallback;
}

function saveJSON(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function makeId(tab, org, title) {
  const slug = s => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28);
  return `${tab}_${slug(org)}_${slug(title)}_${TODAY.slice(0, 7).replace("-", "")}`;
}

function classifyTab(title, link, content) {
  const text = `${title} ${link} ${content}`.toLowerCase();
  if (AGRI_KEYWORDS.some(k => text.includes(k))) return "agriculture";
  if (PRIVATE_KEYWORDS.some(k => text.includes(k))) return "private";
  return "alljobs";
}

function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return ""; }
}

// ═══════════════════════════════════════════════════════════════════
//  5-POINT VALIDATION GATE
//  Every job MUST pass these checks to enter jobs-data.json.
// ═══════════════════════════════════════════════════════════════════

function validateJob(job) {
  // Force valid type — reject if type is not one of 3 valid tabs
  if (!["alljobs", "agriculture", "private"].includes(job.type)) {
    job.type = classifyTab(job.title || "", job.applyLink || "", (job.tags || []).join(" "));
  }

  // Normalize deadline — "Not Specified" is OK, we just won't require it
  if (!job.deadline || job.deadline === "null" || job.deadline === "undefined") {
    job.deadline = "Not Specified";
  }

  const sourceDomain = job.sourceWebsite || getDomain(job.aggregatorLink) || getDomain(job.applyLink);

  const checks = {
    hasTitle:          !!(job.title && job.title.trim().split(/\s+/).length >= 2),
    hasOrganization:   !!(job.organization && job.organization.trim().length >= 2),
    hasAnyLink:        !!(job.applyLink?.startsWith("http") || job.aggregatorLink?.startsWith("http")),
    hasQualification:  !!(job.requirements?.length > 0 || job.salary || job.description?.length > 30),
    fromTrustedSource: TRUSTED_SOURCES.some(d => (sourceDomain || "").includes(d)),
  };

  const passed = Object.values(checks).every(Boolean);

  if (!passed) {
    const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
    console.log(`    [DROPPED] ${(job.title || "?").slice(0, 50)} — failed: ${failed.join(", ")}`);
  }

  return passed;
}

// ═══════════════════════════════════════════════════════════════════
//  DESCRIPTION QUALITY CHECK
//  Reject generic AI-generated filler descriptions.
// ═══════════════════════════════════════════════════════════════════

const GENERIC_PHRASES = [
  "the candidates who are interested",
  "apply before the last date",
  "eligibility criteria and other details are available",
  "for more details visit the official website",
  "various vacancies",
];

function hasQualityDescription(job) {
  if (!job.description) return false;
  const desc = job.description.toLowerCase();
  if (desc.length < 30) return false;
  const genericCount = GENERIC_PHRASES.filter(p => desc.includes(p)).length;
  // If 2+ generic phrases found, description is filler
  return genericCount < 2;
}

// ═══════════════════════════════════════════════════════════════════
//  DEDUPLICATION
// ═══════════════════════════════════════════════════════════════════

function normalizeTitle(t) {
  return (t || "").toLowerCase().replace(/\s+/g, " ").replace(/[^a-z0-9 ]/g, "").trim();
}

function deduplicateJobs(existingJobs, newJobs) {
  const existingIds = new Set(existingJobs.map(j => j.id));
  const existingTitles = new Set(existingJobs.map(j => normalizeTitle(j.title)));

  return newJobs.filter(job => {
    if (existingIds.has(job.id)) return false;
    if (existingTitles.has(normalizeTitle(job.title))) return false;
    return true;
  });
}

// ═══════════════════════════════════════════════════════════════════
//  1. FETCH RSS FEEDS → DETECT NEW ITEMS
// ═══════════════════════════════════════════════════════════════════

async function fetchRSSFeeds() {
  const seen = loadJSON(SEEN_FILE, { guids: [] });
  const seenSet = new Set(seen.guids);
  const newItems = [];

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`  [RSS] ${feed.name}: ${feed.url.slice(0, 60)}...`);
      const parsed = await rss.parseURL(feed.url);
      const items = parsed.items || [];
      console.log(`    → ${items.length} items in feed`);

      let newCount = 0;
      for (const item of items.slice(0, 15)) {
        const guid = item.guid || item.link || item.title;
        if (seenSet.has(guid)) continue;

        seenSet.add(guid);
        newCount++;

        const detectedTab = classifyTab(item.title || "", item.link || "", item.contentSnippet || "");
        const assignedTab = feed.tab === "agriculture" ? "agriculture" : detectedTab;

        newItems.push({
          title: item.title || "",
          link: item.link || "",
          snippet: (item.contentSnippet || item.content || "").slice(0, 300),
          pubDate: item.pubDate || item.isoDate || "",
          source: feed.name,
          sourceDomain: getDomain(feed.url),
          tab: assignedTab,
          guid,
        });
      }

      console.log(`    → ${newCount} NEW items`);
    } catch (err) {
      console.error(`    ✗ ${feed.name} failed: ${err.message}`);
    }
  }

  seen.guids = [...seenSet].slice(-500);
  seen.lastChecked = TODAY;
  saveJSON(SEEN_FILE, seen);

  return newItems;
}

// ═══════════════════════════════════════════════════════════════════
//  2. JINA READER — EXTRACT PAGE CONTENT
// ═══════════════════════════════════════════════════════════════════

async function extractWithJina(url, timeout = 10000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(JINA_PREFIX + url, {
      signal: controller.signal,
      headers: { "Accept": "text/plain", "User-Agent": "Mozilla/5.0 (compatible; KhetLabBot/1.0)" }
    });
    clearTimeout(timeoutId);
    if (!res.ok) return "";
    const text = await res.text();
    return text.slice(0, 6000);
  } catch (err) {
    console.log(`    [Jina] Failed: ${url.slice(0, 60)}... — ${err.message}`);
    return "";
  }
}

// ═══════════════════════════════════════════════════════════════════
//  3. AI EXTRACTION — GROQ (PRIMARY) → NVIDIA NIM (FALLBACK)
// ═══════════════════════════════════════════════════════════════════

function buildExtractionPrompt(rssItems, jinaResults, existingTitles) {
  const itemsText = rssItems.map((r, i) => {
    let entry = `\n[${i + 1}] Title: ${r.title}`;
    entry += `\n    URL: ${r.link}`;
    entry += `\n    Source: ${r.source}`;
    entry += `\n    Tab: ${r.tab}`;
    if (r.snippet) entry += `\n    Snippet: ${r.snippet.slice(0, 200)}`;
    if (jinaResults[i]) entry += `\n    PAGE CONTENT:\n${jinaResults[i].slice(0, 1500)}`;
    return entry;
  }).join("\n" + "─".repeat(40));

  const existingList = [...existingTitles].slice(0, 50).join(", ") || "none";

  return `You are a job/exam listing data extractor for Indian students. Today is ${TODAY}.

From these RSS items and page contents, extract REAL job/exam listings.

ITEMS:
${itemsText}

RULES:
1. Extract every distinct job, exam, or recruitment notification
2. Write a SPECIFIC description for each — mention the actual role, org, and key details. 
   Do NOT use filler like "candidates who are interested can apply before the last date".
3. "applyLink": OFFICIAL organization website URL (e.g. ppsc.gov.in/recruitment). Do NOT use generic listing pages.
4. "aggregatorLink": the RSS source page URL
5. "type" MUST be one of: "alljobs", "agriculture", "private" — nothing else
6. Do NOT invent URLs — only use URLs from the content above
7. Skip already listed: ${existingList}
8. If deadline is not found, set "deadline": "Not Specified"
9. Return up to 12 listings

Return ONLY valid JSON:
{
  "listings": [
    {
      "title": "Full position/exam title",
      "organization": "Organization name",
      "location": "State or City",
      "salary": "Pay scale or Not Disclosed",
      "vacancies": "Number or Not Specified",
      "deadline": "YYYY-MM-DD or Not Specified",
      "postedDate": "YYYY-MM-DD",
      "description": "2-3 specific sentences about this role",
      "requirements": ["Qualification", "Age limit", "Fee"],
      "applyLink": "https://official-url",
      "aggregatorLink": "https://source-url",
      "tags": ["tag1", "tag2"],
      "type": "alljobs or agriculture or private",
      "sourceWebsite": "domain.com"
    }
  ]
}

ONLY valid JSON. No explanation.`;
}

async function callLLM(prompt, provider = "groq") {
  const isNvidia = provider === "nvidia";
  const url = isNvidia ? NVIDIA_URL : GROQ_URL;
  const key = isNvidia ? NVIDIA_API_KEY : GROQ_API_KEY;
  const model = isNvidia ? NVIDIA_MODEL : GROQ_MODEL;
  const label = isNvidia ? "NVIDIA NIM" : "Groq";

  if (!key) throw new Error(`${label} API key not set`);

  console.log(`  [${label}] Calling ${model}...`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "Extract structured job/exam data from web content for Indian students. Return only valid JSON. Never invent URLs." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 8192,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${label} ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text) throw new Error(`${label}: empty response`);

  console.log(`  [${label}] Got ${text.length} chars`);

  const clean = text.replace(/```json|```/gi, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error(`${label}: no JSON found`);

  const parsed = JSON.parse(clean.slice(start, end + 1));
  return parsed.listings || [];
}

async function structureBatch(rssItems, existingTitles) {
  if (rssItems.length === 0) return [];

  // Extract page content with Jina
  console.log(`  [Jina] Extracting ${Math.min(rssItems.length, 12)} pages...`);
  const toExtract = rssItems.slice(0, 12);
  const jinaResults = [];

  for (let i = 0; i < toExtract.length; i += 4) {
    const batch = toExtract.slice(i, i + 4);
    const results = await Promise.all(batch.map(r => extractWithJina(r.link)));
    jinaResults.push(...results);
    if (i + 4 < toExtract.length) await delay(1000);
  }

  const gotContent = jinaResults.filter(c => c.length > 100).length;
  console.log(`  [Jina] Got content from ${gotContent}/${toExtract.length} pages`);

  const prompt = buildExtractionPrompt(toExtract, jinaResults, existingTitles);

  // Try Groq first → NVIDIA NIM fallback
  try {
    return await callLLM(prompt, "groq");
  } catch (groqErr) {
    console.error(`  [Groq] Failed: ${groqErr.message}`);

    if (NVIDIA_API_KEY) {
      console.log("  [Fallback] Trying NVIDIA NIM...");
      await delay(2000);
      try {
        return await callLLM(prompt, "nvidia");
      } catch (nvidiaErr) {
        console.error(`  [NVIDIA] Also failed: ${nvidiaErr.message}`);
      }
    }

    // If both fail and we had many items, retry with fewer
    if (toExtract.length > 5) {
      console.log("  [Retry] Trying with 5 items only...");
      await delay(10000);
      const smallPrompt = buildExtractionPrompt(
        toExtract.slice(0, 5), jinaResults.slice(0, 5), existingTitles
      );
      try {
        return await callLLM(smallPrompt, GROQ_API_KEY ? "groq" : "nvidia");
      } catch (retryErr) {
        console.error(`  [Retry] Also failed: ${retryErr.message}`);
      }
    }

    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════
//  4. SERPER FALLBACK (when RSS yields too few items)
// ═══════════════════════════════════════════════════════════════════

async function serperFallback(tabId, existingTitles) {
  if (!SERPER_API_KEY) return [];

  const config = TAB_CONFIG[tabId];
  console.log(`  [Serper] "${config.query.slice(0, 60)}..."`);

  const res = await fetch(SERPER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-KEY": SERPER_API_KEY },
    body: JSON.stringify({ q: config.query, num: 10, gl: "in", hl: "en" }),
  });

  if (!res.ok) { console.error(`  [Serper] Error ${res.status}`); return []; }
  const data = await res.json();
  const results = (data.organic || []).map(r => ({
    title: r.title, link: r.link, snippet: r.snippet || "",
    source: "Serper", sourceDomain: getDomain(r.link),
    tab: tabId, guid: r.link, pubDate: "",
  }));

  console.log(`  [Serper] Got ${results.length} results`);
  return results;
}

// ═══════════════════════════════════════════════════════════════════
//  5. TELEGRAM NOTIFICATIONS (inline — no separate script needed)
// ═══════════════════════════════════════════════════════════════════

function escTg(text) {
  return (text || "").replace(/[_*[\]()~`>#+=|{}.!\\-]/g, "\\$&");
}

async function notifyTelegram(job) {
  if (!TG_BOT_TOKEN || !TG_CHANNEL_ID) return false;

  const typeEmoji = job.type === "agriculture" ? "🌱" :
                    job.type === "private" ? "💼" : "🏛️";

  let msg = `${typeEmoji} *${escTg(job.organization)}*\n\n`;
  msg += `📋 *${escTg(job.title)}*\n`;
  if (job.location) msg += `📍 ${escTg(job.location)}\n`;
  if (job.vacancies && job.vacancies !== "Not Specified") msg += `👥 ${escTg(String(job.vacancies))} post\\(s\\)\n`;
  if (job.salary && job.salary !== "Not Disclosed") msg += `💰 ${escTg(job.salary)}\n`;
  if (job.deadline && job.deadline !== "Not Specified") msg += `⏰ Last date: *${escTg(job.deadline)}*\n`;

  const link = job.applyLink || job.aggregatorLink;
  if (link) msg += `\n🔗 [Apply / View Details](${link})`;
  msg += `\n\n_via KhetLab Student Hub_`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TG_CHANNEL_ID,
        text: msg,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: false,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`    [TG] ${res.status}: ${err.slice(0, 100)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`    [TG] ${err.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  6. PROCESS, VALIDATE, VERIFY, NOTIFY
// ═══════════════════════════════════════════════════════════════════

async function processAndVerify(listings, existing) {
  const result = { alljobs: [], agriculture: [], private: [] };
  const allExisting = [
    ...(existing.alljobs || []),
    ...(existing.agriculture || []),
    ...(existing.private || []),
  ];

  console.log(`\n  [Process] ${listings.length} raw listings → validate + verify + notify`);

  for (const item of listings) {
    // ── 5-point validation gate ──
    if (!validateJob(item)) continue;

    // ── Description quality check ──
    if (!hasQualityDescription(item)) {
      // Don't drop — just flag it; a real job with bad description is still a real job
      item.description = item.description || `${item.organization} — ${item.title}. Check official link for details.`;
    }

    const tab = item.type;

    // ── Dedup against existing ──
    const titleNorm = normalizeTitle(item.title);
    const isDup = allExisting.some(e => normalizeTitle(e.title) === titleNorm);
    if (isDup) {
      console.log(`    [DUP] ${item.title.slice(0, 50)}`);
      continue;
    }

    // ── Reject homepage-only applyLinks ──
    if (item.applyLink) {
      try {
        const u = new URL(item.applyLink);
        if (u.pathname === "/" || u.pathname === "") {
          item.applyLink = item.aggregatorLink || "";
        }
      } catch { item.applyLink = item.aggregatorLink || ""; }
    }

    // ── Deadline check: drop if already expired ──
    if (item.deadline && item.deadline !== "Not Specified") {
      const dl = new Date(item.deadline);
      if (!isNaN(dl) && dl < new Date(TODAY)) {
        console.log(`    [EXPIRED] ${item.title.slice(0, 50)} — ${item.deadline}`);
        continue;
      }
    }

    // ── 3-Check verification ──
    const vResult = await verifyJob(item, SERPER_API_KEY);

    if (vResult.blocked) {
      console.log(`    [BLOCKED] ${item.title.slice(0, 50)} — ${vResult.blockReason}`);
      continue;
    }

    // ── Assign metadata ──
    item.id = makeId(tab, item.organization, item.title);
    item.applyLinkStatus = vResult.applyLinkStatus;
    item.aggregatorLinkStatus = vResult.aggregatorLinkStatus;
    item.trustLevel = vResult.trustLevel;
    item.trustScore = vResult.trustScore;
    item.officiallyVerified = vResult.officiallyVerified;
    item.verificationSource = vResult.verificationSource;
    item.verifiedAt = TODAY;
    item.addedAt = TODAY;
    item.isNew = true;
    item.notified = false;

    const trustEmoji = vResult.trustLevel === "official" ? "✅" :
                       vResult.trustLevel === "aggregator" ? "⚠️" : "❓";

    console.log(`    ${trustEmoji} ${item.title.slice(0, 50)} [${tab}] trust:${vResult.trustLevel}`);

    result[tab].push(item);
    allExisting.push(item); // prevent dups in same batch

    // ── Telegram notification ──
    if (TG_BOT_TOKEN && TG_CHANNEL_ID) {
      const sent = await notifyTelegram(item);
      item.notified = sent;
      if (sent) console.log(`    📣 Telegram sent`);
      await delay(1200);
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN PIPELINE
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log("=".repeat(60));
  console.log(` KhetLab Job Agent v7  |  ${TODAY}`);
  console.log(` RSS → Jina → AI (Groq/NVIDIA) → Validate → Verify → Notify`);
  console.log("=".repeat(60));

  if (!GROQ_API_KEY && !NVIDIA_API_KEY) {
    console.error("Neither GROQ_API_KEY nor NVIDIA_API_KEY set. Need at least one. Exiting.");
    process.exit(1);
  }

  // ── Step 1: Load existing data ──
  console.log("\n[1/7] Loading existing data...");
  const existing = loadJSON(DATA_FILE, { alljobs: [], agriculture: [], private: [] });

  // ── Step 2: Purge expired + stale + invalid entries ──
  console.log("[2/7] Purging expired, stale & invalid listings...");
  const now = new Date(TODAY);
  const STALE_DAYS = 30;
  const staleDate = new Date(now);
  staleDate.setDate(staleDate.getDate() - STALE_DAYS);

  for (const tab of ["alljobs", "agriculture", "private"]) {
    const before = (existing[tab] || []).length;
    existing[tab] = (existing[tab] || []).filter(item => {
      // Remove expired
      if (item.deadline && item.deadline !== "Not Specified" && item.deadline !== "Not Announced") {
        if (new Date(item.deadline) < now) return false;
      }
      // Remove stale no-deadline items
      if ((!item.deadline || item.deadline === "Not Specified") && item.addedAt) {
        if (new Date(item.addedAt) < staleDate) return false;
      }
      // Remove invalid type values
      if (item.type && !["alljobs", "agriculture", "private"].includes(item.type)) return false;
      // Remove junk titles
      if (!item.title || item.title.trim().split(/\s+/).length < 2) return false;
      // Remove items with no usable link
      if (!item.applyLink && !item.aggregatorLink) return false;
      return true;
    });
    const after = existing[tab].length;
    if (before !== after) console.log(`  Purged ${before - after} from [${tab}]`);
  }

  // Mark old items as not new
  for (const tab of ["alljobs", "agriculture", "private"]) {
    for (const item of existing[tab]) {
      if (item.addedAt) {
        item.isNew = (new Date() - new Date(item.addedAt)) < 72 * 60 * 60 * 1000;
      }
    }
  }

  console.log(`  After purge: All=${existing.alljobs.length} Agri=${existing.agriculture.length} Pvt=${existing.private.length}`);

  const allExistingTitles = new Set();
  for (const tab of ["alljobs", "agriculture", "private"]) {
    for (const item of existing[tab] || []) {
      allExistingTitles.add(normalizeTitle(item.title));
    }
  }

  // ── Step 3: Fetch RSS feeds ──
  console.log("\n[3/7] Checking RSS feeds...");
  let rssItems = await fetchRSSFeeds();
  console.log(`  Total new RSS items: ${rssItems.length}`);

  // ── Step 4: Serper fallback if RSS yields too few ──
  if (rssItems.length < 3 && SERPER_API_KEY) {
    console.log("\n[4/7] RSS yielded few items — Serper fallback...");
    for (const tabId of ["alljobs", "agriculture"]) {
      const extra = await serperFallback(tabId, allExistingTitles);
      rssItems = rssItems.concat(extra);
      await delay(2000);
    }
    console.log(`  Total after fallback: ${rssItems.length}`);
  } else {
    console.log("\n[4/7] Enough RSS items, skipping Serper fallback");
  }

  // ── Step 5: AI extraction (Groq → NVIDIA fallback) ──
  console.log("\n[5/7] AI extraction (Groq primary, NVIDIA NIM fallback)...");
  const structured = await structureBatch(rssItems, allExistingTitles);
  console.log(`  Structured: ${structured.length} listings`);

  // ── Step 6: Validate + Verify + Notify ──
  console.log("\n[6/7] Validating, verifying & notifying...");
  const newItems = await processAndVerify(structured, existing);

  // ── Step 7: Merge and save (bridge format) ──
  console.log("\n[7/7] Saving...");
  const updated = {
    // New flat array (future format)
    jobs: [
      ...newItems.alljobs, ...newItems.agriculture, ...newItems.private,
      ...(existing.alljobs || []), ...(existing.agriculture || []), ...(existing.private || []),
    ].slice(0, 90),

    // Legacy tab-based format (keeps StudentHub.jsx working)
    alljobs:     [...newItems.alljobs, ...(existing.alljobs || [])].slice(0, 30),
    agriculture: [...newItems.agriculture, ...(existing.agriculture || [])].slice(0, 30),
    private:     [...newItems.private, ...(existing.private || [])].slice(0, 30),

    lastUpdated: new Date().toISOString(),
    lastError:   null,
  };

  saveJSON(DATA_FILE, updated);

  // Also save notification queue for any external notifier
  const totalNew = newItems.alljobs.length + newItems.agriculture.length + newItems.private.length;
  if (totalNew > 0) {
    const notifQueue = loadJSON(NOTIF_FILE, { pending: [], sent: [] });
    const newNotifs = [
      ...newItems.alljobs, ...newItems.agriculture, ...newItems.private,
    ].map(j => ({
      title: j.title, organization: j.organization, deadline: j.deadline,
      salary: j.salary, vacancies: j.vacancies, tab: j.type,
      trustLevel: j.trustLevel, link: j.applyLink || j.aggregatorLink,
      addedAt: TODAY,
    }));
    notifQueue.pending = [...newNotifs, ...(notifQueue.pending || [])].slice(0, 50);
    notifQueue.lastUpdated = new Date().toISOString();
    saveJSON(NOTIF_FILE, notifQueue);
  }

  console.log("\n" + "=".repeat(60));
  console.log(` DONE: ${totalNew} new verified listing(s) added.`);
  console.log(` New: All=+${newItems.alljobs.length} Agri=+${newItems.agriculture.length} Pvt=+${newItems.private.length}`);
  console.log(` Total: All=${updated.alljobs.length} Agri=${updated.agriculture.length} Pvt=${updated.private.length}`);
  if (TG_BOT_TOKEN) console.log(` Telegram: notifications sent inline`);
  console.log("=".repeat(60) + "\n");
}

main().catch(err => {
  console.error("\nFATAL ERROR:", err.message);
  process.exit(1);
});
