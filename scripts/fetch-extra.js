// ═══════════════════════════════════════════════════════════════════
//  fetch-extra.js  —  One-time deep scrape of specific URLs
//  Jina Reader → Groq → merge into jobs-data.json
// ═══════════════════════════════════════════════════════════════════

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE  = path.join(__dirname, "..", "public", "jobs-data.json");
const GROQ_KEY   = process.env.GROQ_API_KEY;
const GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const JINA_PREFIX = "https://r.jina.ai/";
const TODAY = new Date().toISOString().split("T")[0];

// ── Direct URLs to scrape ──────────────────────────────────────────
const TARGETS = [
  // Batch 2: URLs that failed due to rate limiting
  {
    url: "https://sarkariexam.com",
    tab: "alljobs",
    desc: "Latest exams from SarkariExam"
  },
  {
    url: "https://sarkarinetwork.com/punjab/",
    tab: "alljobs",
    desc: "Punjab jobs from SarkariNetwork"
  },
  {
    url: "https://rojgarresult.com/",
    tab: "alljobs",
    desc: "Latest jobs from RojgarResult"
  },
  {
    url: "https://www.freejobalert.com/asrb/",
    tab: "agriculture",
    desc: "ASRB exams from FreeJobAlert"
  },
  {
    url: "https://www.freshersworld.com/jobs/jobsearch/punjab-jobs",
    tab: "private",
    desc: "Fresher jobs in Punjab from FreshersWorld"
  },
  {
    url: "https://www.freejobalert.com/latest-notifications/",
    tab: "alljobs",
    desc: "Latest notifications from FreeJobAlert"
  },
  {
    url: "https://www.freejobalert.com/punjab-govt-jobs/",
    tab: "alljobs",
    desc: "Punjab state govt jobs from FreeJobAlert"
  }
];

// ── Load existing data ──────────────────────────────────────────
function loadExisting() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (_) {}
  return { alljobs: [], agriculture: [], private: [], lastUpdated: null };
}

// ── Extract with Jina ───────────────────────────────────────────
async function jinaExtract(url) {
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(JINA_PREFIX + url, {
      signal: controller.signal,
      headers: { "Accept": "text/plain", "User-Agent": "Mozilla/5.0 (compatible; KhetLabBot/1.0)" }
    });
    clearTimeout(tid);
    if (!res.ok) return "";
    const text = await res.text();
    return text.slice(0, 6000);
  } catch (e) {
    console.log(`    [Jina] Failed: ${e.message}`);
    return "";
  }
}

// ── Structure with Groq ─────────────────────────────────────────
async function structureJobs(tabId, content, sourceUrl, existingTitles) {
  const domain = new URL(sourceUrl).hostname.replace("www.", "");
  
  const prompt = `You are a job listing data extractor. Today is ${TODAY}.

From this page content, extract ALL job/exam/recruitment listings you can find.

PAGE URL: ${sourceUrl}
PAGE CONTENT:
${content}

RULES:
- Extract every distinct job, exam, or recruitment notification found on the page
- Only include items with application deadlines AFTER ${TODAY} (or if deadline unknown, include them)
- "applyLink": use the OFFICIAL organization website URL if mentioned (e.g. ppsc.gov.in, ssc.nic.in)
- "aggregatorLink": use "${sourceUrl}" or a specific sub-page URL from the content
- If no official link is found, use the aggregator URL for both
- Do NOT invent URLs
- Skip titles already listed: ${[...existingTitles].slice(0, 30).join(", ") || "none"}
- Return up to 10 listings

Return ONLY valid JSON:
{
  "${tabId}": [
    {
      "title": "Position title",
      "organization": "Organization name",
      "location": "State or City",
      "salary": "Pay scale or Not Disclosed",
      "deadline": "YYYY-MM-DD or Not Specified",
      "postedDate": "YYYY-MM-DD",
      "description": "Brief description",
      "requirements": ["Qualification"],
      "applyLink": "https://official-url",
      "aggregatorLink": "https://aggregator-url",
      "tags": ["tag"],
      "type": "${tabId}",
      "sourceWebsite": "${domain}"
    }
  ]
}

ONLY valid JSON. No explanation.`;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "Extract structured job listings from web page content. Return only valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 8192,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq ${res.status}: ${err.slice(0, 150)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";
  const clean = text.replace(/```json|```/gi, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1) return [];
  const parsed = JSON.parse(clean.slice(start, end + 1));
  return parsed[tabId] || [];
}

// ── Verify link ─────────────────────────────────────────────────
async function verifyLink(url) {
  if (!url || !url.startsWith("http")) return { status: "invalid", live: false };
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 5000);
    const r = await fetch(url, { method: "HEAD", signal: c.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });
    clearTimeout(t);
    const live = r.status >= 200 && r.status < 400;
    return { status: live ? "live" : "dead", live };
  } catch { return { status: "dead", live: false }; }
}

// ── Make ID ─────────────────────────────────────────────────────
function makeId(tab, org, title) {
  const slug = s => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28);
  return `${tab}_${slug(org)}_${slug(title)}_${TODAY.slice(0, 7).replace("-", "")}`;
}

// ── MAIN ────────────────────────────────────────────────────────
async function main() {
  console.log("=".repeat(60));
  console.log(` KhetLab Extra Fetch — Deep Scrape  |  ${TODAY}`);
  console.log(` Scraping ${TARGETS.length} URLs directly`);
  console.log("=".repeat(60));

  if (!GROQ_KEY) { console.error("GROQ_API_KEY not set"); process.exit(1); }

  const existing = loadExisting();
  const updated = {
    alljobs:     [...(existing.alljobs || [])],
    agriculture: [...(existing.agriculture || [])],
    private:     [...(existing.private || [])],
    lastUpdated: TODAY,
    lastError: null,
  };

  // Build title sets for dedup
  const titleSets = {};
  for (const tab of ["alljobs", "agriculture", "private"]) {
    titleSets[tab] = new Set((updated[tab] || []).map(j => (j.title || "").toLowerCase().trim()));
  }

  let totalNew = 0;

  for (let i = 0; i < TARGETS.length; i++) {
    const t = TARGETS[i];
    console.log(`\n[${i + 1}/${TARGETS.length}] ${t.desc}`);
    console.log(`    URL: ${t.url}`);

    // Extract
    const content = await jinaExtract(t.url);
    if (!content) { console.log("    SKIP: No content extracted"); continue; }
    console.log(`    [Jina] Got ${content.length} chars`);

    // Structure
    try {
      const items = await structureJobs(t.tab, content, t.url, titleSets[t.tab]);
      console.log(`    [Groq] Parsed ${items.length} listings`);

      let added = 0;
      for (const item of items) {
        if (!item?.title || !item?.organization) continue;

        // Dedup
        const key = item.title.toLowerCase().trim();
        if (titleSets[t.tab].has(key)) {
          console.log(`    SKIP (dup): ${item.title}`);
          continue;
        }

        // Deadline check
        if (item.deadline && item.deadline !== "Not Specified") {
          const dl = new Date(item.deadline);
          if (!isNaN(dl) && dl < new Date(TODAY)) {
            console.log(`    SKIP (expired): ${item.title} — ${item.deadline}`);
            continue;
          }
        }

        // Generate ID
        item.id = makeId(t.tab, item.organization, item.title);

        // Verify links
        const [offChk, aggChk] = await Promise.all([
          verifyLink(item.applyLink),
          verifyLink(item.aggregatorLink)
        ]);
        item.applyLinkStatus = offChk.status;
        item.aggregatorLinkStatus = aggChk.status;
        item.verifiedAt = TODAY;

        if (!offChk.live && !aggChk.live) {
          console.log(`    SKIP (dead): ${item.title}`);
          continue;
        }

        console.log(`    ✓ ${item.title} (off:${offChk.status}, agg:${aggChk.status})`);
        updated[t.tab].push(item);
        titleSets[t.tab].add(key);
        added++;
        totalNew++;

        if (added >= 8) break;
      }

      console.log(`    Added ${added} new to [${t.tab}]`);
    } catch (err) {
      console.error(`    ERROR: ${err.message}`);
    }

    // Rate limit: 12s between Groq calls to avoid token-per-minute limits
    if (i < TARGETS.length - 1) {
      console.log("    Waiting 12s (rate limit)...");
      await new Promise(r => setTimeout(r, 12000));
    }
  }

  // Cap at 30 per tab
  for (const tab of ["alljobs", "agriculture", "private"]) {
    updated[tab] = updated[tab].slice(0, 30);
  }

  // Save
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));

  console.log("\n" + "=".repeat(60));
  console.log(` DONE: ${totalNew} new listing(s) scraped.`);
  console.log(` Total: All=${updated.alljobs.length} Agri=${updated.agriculture.length} Pvt=${updated.private.length}`);
  console.log("=".repeat(60));
}

main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
