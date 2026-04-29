// ═══════════════════════════════════════════════════════════
//  test-api.js  —  KhetLab API Debug Test
//  Purpose: Confirm Gemini API fetches real job data
//  NOT linked to website. Saves to test-results.json only.
//  Run: node scripts/test-api.js
// ═══════════════════════════════════════════════════════════

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY   = process.env.GEMINI_API_KEY;
const TODAY     = new Date().toISOString().split("T")[0];

const TABS = [
  {
    id: "private",
    label: "Private Jobs",
    query: "private agriculture company jobs hiring Punjab India 2026 site:naukri.com OR site:pgrkam.com OR site:linkedin.com"
  },
  {
    id: "government",
    label: "Government Jobs",
    query: "government agriculture jobs Punjab 2026 recruitment notification site:freejobalert.com OR site:sarkariresult.com OR site:ppsc.gov.in"
  },
  {
    id: "exams",
    label: "Agriculture Exams",
    query: "agriculture competitive exam 2026 Punjab notification IBPS AFO PAU CET site:freejobalert.com OR site:sarkariresult.com"
  },
  {
    id: "general",
    label: "Any Graduate",
    query: "any graduate jobs Punjab 2026 recruitment notification site:freejobalert.com OR site:sarkariresult.com OR site:pgrkam.com"
  }
];

async function testTab(tab) {
  console.log(`\n${"─".repeat(50)}`);
  console.log(`TAB: ${tab.label}`);
  console.log(`${"─".repeat(50)}`);

  const prompt = `Today is ${TODAY}. Find ONE real job or exam notification posted in the last 30 days for: ${tab.label} in Punjab, India.

Search: ${tab.query}

Return ONLY this JSON (no markdown, no extra text):
{
  "title": "exact job title",
  "organization": "exact org name",
  "location": "city, Punjab",
  "deadline": "YYYY-MM-DD",
  "applyLink": "https://direct-official-link",
  "sourceLink": "https://freejobalert.com or similar aggregator link",
  "sourceSite": "freejobalert.com"
}`;

  // ── Single call: NO grounding, responseMimeType=json ─────
  console.log("\n[Test] NO grounding + responseMimeType: application/json");
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }], role: "user" }],
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      console.log(`  HTTP ${res.status}: ${JSON.stringify(data).substring(0, 300)}`);
      return null;
    }
    const candidate = data?.candidates?.[0];
    const text = (candidate?.content?.parts || []).filter(p => p.text).map(p => p.text).join("") || "";
    console.log(`  finishReason: ${candidate?.finishReason}`);
    if (data?.promptFeedback?.blockReason) console.log(`  BLOCKED: ${data.promptFeedback.blockReason}`);
    if (candidate?.finishReason !== "STOP") console.log(`  safetyRatings: ${JSON.stringify(candidate?.safetyRatings)}`);
    console.log(`  Response length: ${text.length} chars`);
    console.log(`  Raw output:\n${text.substring(0, 800)}`);
    
    try {
      const parsed = JSON.parse(text);
      console.log(`  ✅ JSON PARSED OK:`, JSON.stringify(parsed, null, 2));
      return { tab: tab.id, job: parsed };
    } catch (e) {
      console.log(`  ❌ JSON PARSE FAILED: ${e.message}`);
      console.log(`  Full text: ${text}`);
      return null;
    }
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
    return null;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log(` KhetLab API DEBUG TEST  |  ${TODAY}`);
  console.log(` Testing: gemini-2.0-flash with/without google_search`);
  console.log("=".repeat(60));

  if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY not set!");
    process.exit(1);
  }
  console.log(`✅ API key present (${API_KEY.substring(0, 8)}...)`);

  const results = [];

  for (const tab of TABS) {
    const result = await testTab(tab);
    if (result) results.push(result);
    await new Promise(r => setTimeout(r, 5000));
  }

  console.log("\n" + "=".repeat(60));
  console.log(" SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total tabs tested: ${TABS.length}`);
  console.log(`Successful parses: ${results.length}`);
  results.forEach(r => console.log(`  ✅ ${r.tab}`));

  const outFile = path.join(__dirname, "..", "public", "test-results.json");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({ date: TODAY, results }, null, 2));
  console.log(`\nSaved to public/test-results.json`);
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
